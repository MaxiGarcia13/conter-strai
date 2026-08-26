import type { APIRoute } from 'astro';
import { MatchMakerState } from '@colyseus/core/MatchMaker';
import { matchMaker } from 'colyseus';
import { DEFAULT_SCENARIO_ID } from '@/modules/game/constants/play-defaults';
import { generateRoomId } from '@/modules/lobby/utils/generate-room-id';
import { decodeCreateRoomOptions } from '@/modules/multiplayer/adapters/decode-create-room-options';
import { createEmptyRoomSnapshot } from '@/modules/multiplayer/adapters/to-room-snapshot';

export const createRoom: APIRoute = async ({ request }) => {
  if (matchMaker.state !== MatchMakerState.READY) {
    return new Response(JSON.stringify({ error: 'Matchmaker is not ready' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let body: unknown = {};
  try {
    if (request.headers.get('content-type')?.includes('application/json')) {
      body = await request.json();
    }
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const options = decodeCreateRoomOptions(body);
  if (!options) {
    return new Response(JSON.stringify({ error: 'Invalid room options' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const roomCode = generateRoomId();
  const scenario = options.scenario ?? DEFAULT_SCENARIO_ID;
  await matchMaker.createRoom('match', {
    metadata: {
      roomCode,
      scenario,
    },
  });

  return new Response(JSON.stringify(createEmptyRoomSnapshot(roomCode, scenario)), {
    status: 201,
    headers: { 'Content-Type': 'application/json' },
  });
};
