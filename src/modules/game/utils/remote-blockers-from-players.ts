import type { CircleBlocker } from './resolve-player-collision';
import { PLAYER_RADIUS } from '../constants/player';

export interface RemoteBody {
  x: number;
  z: number;
  entityId: string;
  isEliminated?: boolean;
}

/** Live XZ discs for connected peers. Empty spawn slots are not colliders. */
export function remoteBlockersFromPlayers(
  remotes: Iterable<RemoteBody>,
  radius: number = PLAYER_RADIUS,
): CircleBlocker[] {
  const blockers: CircleBlocker[] = [];

  for (const remote of remotes) {
    if (remote.isEliminated) {
      continue;
    }
    blockers.push({
      x: remote.x,
      z: remote.z,
      radius,
      entityId: remote.entityId,
    });
  }

  return blockers;
}
