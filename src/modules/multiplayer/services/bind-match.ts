import type { MatchHandle } from '../adapters/colyseus-adapter';
import type { EntityId } from '@/modules/soldiers';
import { useHealthStore } from '@/modules/combat';
import { LOCAL_PLAYER_ENTITY_ID } from '@/modules/game/constants/player';
import { requestHitReaction } from '@/modules/soldiers/state/hit-reaction-state';
import { useMultiplayerStore } from '../stores/multiplayer-store';
import { resolveServerHealthEffects } from './resolve-server-health-effects';

const toClientEntity = (sessionId: string): EntityId => sessionId;

/**
 * Feeds an active match into the stores: player/round snapshots populate the
 * multiplayer store, the local player's HP mirrors into the health store (so
 * HealthBar / movement freeze / dying pose stay server-driven), and HP drops
 * trigger hit reactions. Returns an unbind for cleanup on leave/dev remount.
 */
export function bindMatch(handle: MatchHandle): () => void {
  let prevById = new Map<EntityId, number>();

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
    useMultiplayerStore.getState().applyRoundUpdate(payload);
  });

  const offLeave = handle.onLeave(() => {
    useMultiplayerStore.getState().reset();
    useHealthStore.getState().resetAll();
  });

  return () => {
    offPlayerUpdate();
    offRoundUpdate();
    offLeave();
  };
}
