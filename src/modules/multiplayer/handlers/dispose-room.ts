import type { APIRoute } from 'astro';
import type { MatchRoom } from '@/modules/multiplayer/rooms/match-room';
import { findMatchRoomByCode } from '@/modules/multiplayer/utils/find-match-room';
import { isHostToken } from '@/modules/multiplayer/utils/host-token';
import { isRoomExpired } from '@/modules/multiplayer/utils/room-expiry';
import { wait } from '@/utils/wait';
import { jsonResponse, requireMatchMaker } from '../utils/http';
import { requireSameSiteOrigin } from '../utils/request-guards';

function bearerToken(request: Request): string | null {
  const header = request.headers.get('authorization');
  if (!header || !header.startsWith('Bearer ')) {
    return null;
  }
  const token = header.slice('Bearer '.length).trim();
  return token.length > 0 ? token : null;
}

export const disposeRoom: APIRoute = async ({ request, params }) => {
  const unavailable = requireMatchMaker();
  if (unavailable) {
    return unavailable;
  }

  const crossOrigin = requireSameSiteOrigin(request);
  if (crossOrigin) {
    return crossOrigin;
  }

  const hostToken = bearerToken(request);
  if (!hostToken) {
    return jsonResponse(401, { error: 'Missing host token' });
  }

  const roomCode = params.roomId;
  if (!roomCode) {
    return jsonResponse(400, { error: 'Missing roomId' });
  }

  const found = await findMatchRoomByCode(roomCode);
  const room = found?.room as MatchRoom | undefined;
  const expectedToken = found?.roomCache.metadata?.hostToken;
  if (!room || !expectedToken) {
    return jsonResponse(404, { error: 'Room not found' });
  }

  if (isRoomExpired(found?.roomCache.metadata?.expiresAt)) {
    return jsonResponse(410, { error: 'Room expired' });
  }

  if (!isHostToken(hostToken, expectedToken)) {
    return jsonResponse(403, { error: 'Invalid host token' });
  }

  try {
    // Notify clients before teardown so every browser can clear session and go home.
    room.broadcast('roomClosed');
    await wait(50);
    await room.disposeLobby();
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error('Failed to dispose room:', error);
    return jsonResponse(500, { error: 'Failed to dispose room' });
  }
};
