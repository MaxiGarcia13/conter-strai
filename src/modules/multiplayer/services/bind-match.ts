import type { MatchHandle } from '../adapters/colyseus-adapter';
import type { MatchRoundPhase } from '../schema';
import type { EntityId } from '@/modules/soldiers';
import { useHealthStore } from '@/modules/combat';
import { DEFAULT_MAX_HP } from '@/modules/combat/constants/health';
import { LOCAL_PLAYER_ENTITY_ID } from '@/modules/game/constants/player';
import {
  resetPlayerTransform,
  setPlayerLocomotion,
  setPlayerPose,
} from '@/modules/game/state/player-state';
import { clearRoomSession } from '@/modules/lobby/utils/room-session';
import { requestHitReaction } from '@/modules/soldiers/state/hit-reaction-state';
import { useMultiplayerStore } from '../stores/multiplayer-store';
import { resolveServerHealthEffects } from './resolve-server-health-effects';

const toClientEntity = (sessionId: string): EntityId => sessionId;

/** Snap local FPS state after a server round restart (spawn + clear dying). */
function applyLocalRoundRespawn(handle: MatchHandle): void {
  const local = handle.players.find((player) => player.sessionId === handle.localPlayerId);
  if (!local) {
    return;
  }
  resetPlayerTransform(local.x, local.z, local.rotY);
  setPlayerPose(null);
  setPlayerLocomotion('idle');
  useHealthStore.getState().syncHealth(LOCAL_PLAYER_ENTITY_ID, {
    currentHp: local.hp,
    maxHp: DEFAULT_MAX_HP,
    isEliminated: local.eliminated,
  });
}

/**
 * Feeds an active match into the stores: player/round snapshots populate the
 * multiplayer store, the local player's HP mirrors into the health store (so
 * HealthBar / movement freeze / dying pose stay server-driven), and HP drops
 * trigger hit reactions. Returns an unbind for cleanup on leave/dev remount.
 */
export function bindMatch(handle: MatchHandle, roomId: string): () => void {
  let prevById = new Map<EntityId, number>();
  let prevRoundPhase: MatchRoundPhase | null = null;

  const offPlayerUpdate = handle.onPlayerUpdate((payload) => {
    const { localHealth, hitReactions, nextById } = resolveServerHealthEffects(payload, prevById);
    prevById = nextById;

    useMultiplayerStore.getState().applyPlayersUpdate(payload);

    if (localHealth) {
      const current = useHealthStore.getState().getHealth(LOCAL_PLAYER_ENTITY_ID);
      const changed = !current
        || current.currentHp !== localHealth.currentHp
        || current.isEliminated !== localHealth.isEliminated;
      if (changed) {
        useHealthStore.getState().syncHealth(LOCAL_PLAYER_ENTITY_ID, localHealth);
      }
    }

    for (const sessionId of hitReactions) {
      requestHitReaction(
        sessionId === payload.localSessionId ? LOCAL_PLAYER_ENTITY_ID : toClientEntity(sessionId),
      );
    }
  });

  const offRoundUpdate = handle.onRoundUpdate((payload) => {
    const enteringDeploying = payload.phase === 'deploying' && prevRoundPhase !== 'deploying';
    const enteringCountdown = payload.phase === 'countdown' && prevRoundPhase !== 'countdown';
    const enteringInProgress = payload.phase === 'in_progress' && prevRoundPhase !== 'in_progress';
    prevRoundPhase = payload.phase;
    useMultiplayerStore.getState().applyRoundUpdate(payload);

    if (enteringDeploying || enteringCountdown || enteringInProgress) {
      applyLocalRoundRespawn(handle);
    }
  });

  const offPose = handle.onPose((payload) => {
    useMultiplayerStore.getState().applyRemotePose(payload.sessionId, payload.pose);
  });

  const offLeave = handle.onLeave(() => {
    useMultiplayerStore.getState().reset();
    useHealthStore.getState().resetAll();
  });

  const offRoomClosed = handle.onRoomClosed(() => {
    clearRoomSession(roomId);
    useMultiplayerStore.getState().reset();
    useHealthStore.getState().resetAll();
    window.location.href = '/';
  });

  return () => {
    offPlayerUpdate();
    offRoundUpdate();
    offPose();
    offLeave();
    offRoomClosed();
  };
}
