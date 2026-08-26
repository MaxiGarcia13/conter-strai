import type { APIRoute } from 'astro';
import { toRoomSnapshot } from '@/modules/multiplayer/adapters/to-room-snapshot';
import { findMatchRoomByCode } from '@/modules/multiplayer/services/find-match-room';
import { jsonResponse, requireMatchMaker } from './http';

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

  return jsonResponse(200, toRoomSnapshot(roomCode, found.state));
};
