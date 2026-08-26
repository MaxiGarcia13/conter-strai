import type { APIRoute } from 'astro';
import { matchMaker } from 'colyseus';
import { DEFAULT_SCENARIO_ID } from '@/modules/game/constants/play-defaults';
import { generateRoomId } from '@/modules/lobby/utils/generate-room-id';
import { decodeCreateRoomOptions } from '@/modules/multiplayer/adapters/decode-create-room-options';
import { createEmptyRoomSnapshot } from '@/modules/multiplayer/adapters/to-room-snapshot';
import { jsonResponse, readJsonBody, requireMatchMaker } from '../utils/http';

export const createRoom: APIRoute = async ({ request }) => {
  const unavailable = requireMatchMaker();
  if (unavailable) {
    return unavailable;
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
  await matchMaker.createRoom('match', {
    metadata: {
      roomCode,
      scenario,
    },
  });

  return jsonResponse(201, createEmptyRoomSnapshot(roomCode, scenario));
};
