import { readRoomSession } from '@/modules/lobby/utils/room-session';

export interface RoomHostCapabilities {
  isHost: boolean;
  canRestart: boolean;
}

/**
 * Offline play has no room, so the local player is always host and may restart.
 * Inside a match only the session host can restart the round.
 */
export function resolveRoomHostCapabilities(roomId?: string): RoomHostCapabilities {
  const session = roomId ? readRoomSession(roomId) : null;
  const isHost = session?.role === 'host' || !roomId;
  const canRestart = roomId ? isHost : true;
  return { isHost, canRestart };
}
