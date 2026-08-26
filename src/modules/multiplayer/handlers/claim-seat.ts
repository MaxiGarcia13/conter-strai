import type { APIRoute } from 'astro';
import type { ClaimSeatResponse } from '@/modules/multiplayer/types';
import { matchMaker } from 'colyseus';
import { decodeSeatClaim } from '@/modules/multiplayer/adapters/decode-seat-claim';
import { toRoomSnapshot } from '@/modules/multiplayer/adapters/to-room-snapshot';
import { findMatchRoomByCode } from '@/modules/multiplayer/services/find-match-room';
import { jsonResponse, readJsonBody, requireMatchMaker } from './http';

function isRoomFullError(error: unknown): boolean {
  return error instanceof Error && /already full/i.test(error.message);
}

export const claimSeat: APIRoute = async ({ params, request }) => {
  const unavailable = requireMatchMaker();
  if (unavailable) {
    return unavailable;
  }

  const roomCode = params.roomId;
  if (!roomCode) {
    return jsonResponse(400, { error: 'Missing roomId' });
  }

  const body = await readJsonBody(request);
  if (!body.ok) {
    return body.response;
  }

  const options = decodeSeatClaim(body.value);
  if (!options) {
    return jsonResponse(400, { error: 'Invalid seat claim' });
  }

  const found = await findMatchRoomByCode(roomCode);
  if (!found) {
    return jsonResponse(404, { error: 'Room not found' });
  }
  if (!found.state) {
    return jsonResponse(500, { error: 'Room state unavailable' });
  }

  const snapshot = toRoomSnapshot(roomCode, found.state);
  if (snapshot.phase !== 'waiting') {
    return jsonResponse(409, {
      error: 'Room is not in waiting phase',
      phase: snapshot.phase,
    });
  }

  const maxClients = found.roomCache.maxClients || snapshot.maxPerTeam * 2;
  const occupied = Math.max(snapshot.playerCount, found.roomCache.clients);
  if (found.roomCache.locked || occupied >= maxClients) {
    return jsonResponse(409, { error: 'Room is at maximum capacity' });
  }

  if (!snapshot.teams[options.team].open) {
    return jsonResponse(409, { error: 'Team is full', team: options.team });
  }

  try {
    const reservation = await matchMaker.reserveSeatFor(found.roomCache, options);
    const response: ClaimSeatResponse = {
      snapshot: toRoomSnapshot(roomCode, found.state),
      reservation,
    };
    return jsonResponse(200, response);
  } catch (error) {
    if (isRoomFullError(error)) {
      return jsonResponse(409, { error: 'Room is at maximum capacity' });
    }
    console.error('Failed to reserve seat:', error);
    return jsonResponse(500, { error: 'Failed to reserve seat' });
  }
};
