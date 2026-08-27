import type { HealthState } from '@/modules/combat';
import type { RoundPhase } from '@/modules/game/types';
import type { PlayersUpdatePayload, RoundUpdatePayload } from '@/modules/multiplayer/adapters/colyseus-adapter';
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
}

export interface MultiplayerStoreState {
  /** Remote players keyed by Colyseus session id (local player excluded). */
  remotePlayers: Record<EntityId, RemotePlayerEntry>;
  /** Mapped client phase; null while the room is `waiting`. */
  phase: RoundPhase | null;
  /** Server-declared winning team id, or null before a wipe. */
  winner: Team | null;
  connected: boolean;
  applyPlayersUpdate: (payload: PlayersUpdatePayload) => void;
  applyRoundUpdate: (payload: RoundUpdatePayload) => void;
  reset: () => void;
}
