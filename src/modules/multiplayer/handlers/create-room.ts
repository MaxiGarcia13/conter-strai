import type { APIRoute } from 'astro';
import type { CreateRoomResponse } from '@/modules/multiplayer/types';
import { matchMaker } from 'colyseus';
import { DEFAULT_SCENARIO_ID } from '@/modules/game/constants/play-defaults';
import { generateRoomId } from '@/modules/lobby/utils/generate-room-id';
import { decodeCreateRoomOptions } from '@/modules/multiplayer/adapters/decode-create-room-options';
import { createEmptyRoomSnapshot } from '@/modules/multiplayer/adapters/to-room-snapshot';
import { readE2eRoomTtlMs } from '@/modules/multiplayer/dev/read-e2e-room-ttl-ms';
import { generateHostToken } from '@/modules/multiplayer/utils/host-token';
import { computeExpiresAt } from '@/modules/multiplayer/utils/room-expiry';
import { jsonResponse, readJsonBody, requireMatchMaker } from '../utils/http';
import { requireSameSiteOrigin } from '../utils/request-guards';

export const createRoom: APIRoute = async ({ request }) => {
  const unavailable = requireMatchMaker();
  if (unavailable) {
    return unavailable;
  }

  const crossOrigin = requireSameSiteOrigin(request);
  if (crossOrigin) {
    return crossOrigin;
  }

  const body = await readJsonBody(request);
  if (!body.ok) {
    return body.response;
  }

  const options = decodeCreateRoomOptions(body.value);
  if (!options) {
    return jsonResponse(400, { error: 'Invalid room options' });
  }

  const roomCode = generateRoomId();
  const scenario = options.scenario ?? DEFAULT_SCENARIO_ID;
  const hostToken = generateHostToken();
  const expiresAt = computeExpiresAt(Date.now(), readE2eRoomTtlMs(body.value));
  await matchMaker.createRoom('match', {
    metadata: {
      roomCode,
      scenario,
      hostToken,
      expiresAt,
    },
  });

  const response: CreateRoomResponse = {
    ...createEmptyRoomSnapshot(roomCode, expiresAt, scenario),
    hostToken,
  };
  return jsonResponse(201, response);
};
