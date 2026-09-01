import { clearRoomSession } from '@/modules/lobby/utils/room-session';
import { leaveMatch } from '@/modules/multiplayer/adapters/colyseus-adapter';
import { disposeRoomTolerant } from '@/modules/multiplayer/services/dispose-room-tolerant';

/**
 * Leave to `/` without deleting the room. Disconnects the local match, clears
 * the persisted session, then hard-navigates home. Used by guests and offline.
 */
export function leaveMatchToHome(roomId?: string): void {
  void leaveMatch();
  if (roomId) {
    clearRoomSession(roomId);
  }
  window.location.href = '/';
}

/**
 * Leave to `/` as the room host. Disposes the match via `disposeRoomTolerant`
 * (404-tolerant), clears the session, then hard-navigates home — peers leave
 * themselves on `roomClosed`, so no local `leaveMatch` is needed. Throws the
 * underlying non-404 dispose error so the caller can re-enable its UI.
 */
export async function leaveMatchToHomeAsHost(
  roomId: string,
  hostToken?: string,
): Promise<void> {
  await disposeRoomTolerant(roomId, hostToken);
  clearRoomSession(roomId);
  window.location.href = '/';
}
