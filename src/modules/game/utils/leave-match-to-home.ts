import { clearRoomSession } from '@/modules/lobby/utils/room-session';
import { leaveMatch } from '@/modules/multiplayer/adapters/colyseus-adapter';

/**
 * Leave to `/` without deleting the room (US-9.5). Disconnects the local
 * match if connected, clears the persisted session, then hard-navigates home.
 */
export function leaveMatchToHome(roomId?: string): void {
  void leaveMatch();
  if (roomId) {
    clearRoomSession(roomId);
  }
  window.location.href = '/';
}
