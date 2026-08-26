import type { RoomSnapshot } from '../types';
import { decodeRoomSnapshot } from '@/modules/multiplayer/adapters/decode-room-snapshot';
import { LobbyRestError, lobbyRoomPath, readErrorMessage, readJson } from './lobby-rest';

/** `GET /api/v1/room/{roomId}` — lobby snapshot for join / waiting. */
export async function getRoomSnapshot(roomId: string): Promise<RoomSnapshot> {
  const response = await fetch(lobbyRoomPath(roomId));
  const body: unknown = await readJson(response);
  if (response.status !== 200) {
    throw new LobbyRestError(
      response.status,
      readErrorMessage(body, 'Room not found'),
    );
  }

  const snapshot = decodeRoomSnapshot(body);
  if (!snapshot) {
    throw new LobbyRestError(500, 'Invalid room snapshot');
  }
  return snapshot;
}
