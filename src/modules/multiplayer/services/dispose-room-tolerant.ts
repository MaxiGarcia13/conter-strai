import { deleteRoom } from './delete-room';
import { LobbyRestError } from './lobby-rest';

/**
 * Disposes a match, treating an already-gone room (`404`) as success so a
 * peer's earlier teardown does not surface as an error. Rethrows any other
 * `LobbyRestError` (e.g. `401` unauthorised) and network failures.
 */
export async function disposeRoomTolerant(
  roomId: string,
  hostToken?: string,
): Promise<void> {
  try {
    await deleteRoom(roomId, hostToken);
  } catch (cause) {
    if (cause instanceof LobbyRestError && cause.status === 404) {
      return;
    }
    throw cause;
  }
}
