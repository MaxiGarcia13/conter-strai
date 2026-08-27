import type { RemotePlayerEntry } from './types';
import type { MatchPlayerSnapshot } from '@/modules/multiplayer/adapters/colyseus-adapter';
import { DEFAULT_MAX_HP } from '@/modules/combat/constants/health';

/** Flatten an adapter player snapshot into store shape, reusing `HealthState` + `DEFAULT_MAX_HP`. */
export function toRemotePlayerEntry(snapshot: MatchPlayerSnapshot): RemotePlayerEntry {
  return {
    sessionId: snapshot.sessionId,
    team: snapshot.team,
    skin: snapshot.skin,
    transform: {
      x: snapshot.x,
      y: snapshot.y,
      z: snapshot.z,
      rotY: snapshot.rotY,
    },
    health: {
      currentHp: snapshot.hp,
      maxHp: DEFAULT_MAX_HP,
      isEliminated: snapshot.eliminated,
    },
  };
}
