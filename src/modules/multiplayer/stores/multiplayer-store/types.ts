import type { HealthState } from '@/modules/combat';
import type { RoundPhase } from '@/modules/game/types';
import type { PlayersUpdatePayload, RoundUpdatePayload } from '@/modules/multiplayer/adapters/colyseus-adapter';
import type { RemotePoseMessage, SyncableRemotePose } from '@/modules/multiplayer/utils/syncable-remote-pose';
import type { EntityId, SoldierSkinId } from '@/modules/soldiers';
import type { Team } from '@/modules/teams';

export interface RemotePlayerEntry {
  sessionId: EntityId;
  team: Team;
  skin: SoldierSkinId;
  transform: {
    x: number;
    y: number;
    z: number;
    rotY: number;
  };
  health: HealthState;
  /** Cosmetic clip synced from the peer; missing when never received. */
  pose?: SyncableRemotePose;
  /** Increments on each relayed one-shot so a second jump retriggers the mixer. */
  poseEpoch?: number;
}

export interface MultiplayerStoreState {
  /** Remote players keyed by Colyseus session id (local player excluded). */
  remotePlayers: Record<EntityId, RemotePlayerEntry>;
  /** Mapped client phase; null while the room is `waiting`. */
  phase: RoundPhase | null;
  /** Server-declared winning team id, or null before a wipe. */
  winner: Team | null;
  /** 3|2|1 during countdown; null otherwise. */
  countdown: number | null;
  connected: boolean;
  applyPlayersUpdate: (payload: PlayersUpdatePayload) => void;
  applyRoundUpdate: (payload: RoundUpdatePayload) => void;
  applyRemotePose: (sessionId: EntityId, pose: RemotePoseMessage) => void;
  reset: () => void;
}
