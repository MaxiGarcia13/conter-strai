import type { APIRoute } from 'astro';
import { findMatchRoomByCode } from '@/modules/multiplayer/utils/find-match-room';
import { wait } from '@/utils/wait';
import { jsonResponse, requireMatchMaker } from '../utils/http';

export const disposeRoom: APIRoute = async ({ params }) => {
  const unavailable = requireMatchMaker();
  if (unavailable) {
    return unavailable;
  }

  const roomCode = params.roomId;
  if (!roomCode) {
    return jsonResponse(400, { error: 'Missing roomId' });
  }

  const found = await findMatchRoomByCode(roomCode);
  if (!found?.room) {
    return jsonResponse(404, { error: 'Room not found' });
  }

  try {
    // Notify clients before teardown so every browser can clear session and go home.
    found.room.broadcast('roomClosed');
    await wait(50);
    await found.room.disconnect();
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error('Failed to dispose room:', error);
    return jsonResponse(500, { error: 'Failed to dispose room' });
  }
};
