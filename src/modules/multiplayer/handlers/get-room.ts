import type { APIRoute } from 'astro';
import { toRoomSnapshot } from '@/modules/multiplayer/adapters/to-room-snapshot';
import { findMatchRoomByCode } from '@/modules/multiplayer/utils/find-match-room';
import { isRoomExpired } from '@/modules/multiplayer/utils/room-expiry';
import { jsonResponse, requireMatchMaker } from '../utils/http';

export const getRoom: APIRoute = async ({ params }) => {
  const unavailable = requireMatchMaker();
  if (unavailable) {
    return unavailable;
  }

  const roomCode = params.roomId;
  if (!roomCode) {
    return jsonResponse(400, { error: 'Missing roomId' });
  }

  const found = await findMatchRoomByCode(roomCode);
  if (!found) {
    return jsonResponse(404, { error: 'Room not found' });
  }
  if (!found.state) {
    return jsonResponse(500, { error: 'Room state unavailable' });
  }

  const expiresAt = found.roomCache.metadata?.expiresAt;
  if (isRoomExpired(expiresAt)) {
    return jsonResponse(410, { error: 'Room expired' });
  }

  return jsonResponse(200, toRoomSnapshot(roomCode, found.state, expiresAt));
};
