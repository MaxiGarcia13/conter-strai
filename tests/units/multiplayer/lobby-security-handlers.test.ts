import type { MatchState } from '@/modules/multiplayer/schema';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createRoom } from '@/modules/multiplayer/handlers/create-room';
import { disposeRoom } from '@/modules/multiplayer/handlers/dispose-room';
import { getRoom } from '@/modules/multiplayer/handlers/get-room';
import { createMatchState, createPlayerState } from '@/modules/multiplayer/schema';
import { claimSeat } from '@/modules/multiplayer/utils/claim-seat';

const matchMakerMock = vi.hoisted(() => ({
  state: 1,
  query: vi.fn(),
  getLocalRoomById: vi.fn(),
  createRoom: vi.fn(),
  reserveSeatFor: vi.fn(),
}));

vi.mock('colyseus', () => ({ matchMaker: matchMakerMock }));

const ROOM_CODE = 'ABC123';
const FUTURE_EXPIRY = '2099-01-01T00:00:00.000Z';
const PAST_EXPIRY = '2000-01-01T00:00:00.000Z';

function requestWith(
  url: string,
  init: { method?: string; origin?: string; authorization?: string; body?: string } = {},
): Request {
  const headers = new Headers();
  if (init.origin) {
    headers.set('origin', init.origin);
  }
  if (init.authorization) {
    headers.set('authorization', init.authorization);
  }
  if (init.method === 'POST' || init.method === 'PUT') {
    headers.set('content-type', 'application/json');
  }
  return new Request(`http://localhost:4321${url}`, {
    method: init.method ?? 'GET',
    headers,
    body: init.method === 'POST' || init.method === 'PUT' ? (init.body ?? '{}') : undefined,
  });
}

function stubFoundRoom(
  metadata: Record<string, unknown>,
  overrides: { clients?: number } = {},
): { state: MatchState; broadcast: ReturnType<typeof vi.fn> } {
  const state = createMatchState({ scenario: 'arena-01' }) as MatchState;
  matchMakerMock.query.mockResolvedValue([
    {
      roomId: 'r1',
      clients: overrides.clients,
      metadata: { roomCode: ROOM_CODE, ...metadata },
    },
  ]);
  const broadcast = vi.fn();
  matchMakerMock.getLocalRoomById.mockReturnValue({
    state,
    broadcast,
    disposeLobby: vi.fn().mockResolvedValue(undefined),
  });
  return { state, broadcast };
}

beforeEach(() => {
  vi.clearAllMocks();
  matchMakerMock.state = 1;
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('matchMaker not ready', () => {
  it('returns 503 from getRoom', async () => {
    matchMakerMock.state = 0;
    const response = await getRoom({
      request: requestWith(`/api/v1/room/${ROOM_CODE}`),
      params: { roomId: ROOM_CODE },
    } as never);
    expect(response.status).toBe(503);
    expect(matchMakerMock.query).not.toHaveBeenCalled();
  });

  it('returns 503 from createRoom', async () => {
    matchMakerMock.state = 0;
    const response = await createRoom({
      request: requestWith(`/api/v1/room`, { method: 'POST' }),
      params: {},
    } as never);
    expect(response.status).toBe(503);
    expect(matchMakerMock.createRoom).not.toHaveBeenCalled();
  });

  it('returns 503 from claimSeat', async () => {
    matchMakerMock.state = 0;
    const response = await claimSeat({
      request: requestWith(`/api/v1/room/${ROOM_CODE}`, { method: 'PUT' }),
      params: { roomId: ROOM_CODE },
    } as never);
    expect(response.status).toBe(503);
    expect(matchMakerMock.query).not.toHaveBeenCalled();
  });

  it('returns 503 from disposeRoom', async () => {
    matchMakerMock.state = 0;
    const response = await disposeRoom({
      request: requestWith(`/api/v1/room/${ROOM_CODE}`, {
        method: 'DELETE',
        authorization: 'Bearer token',
      }),
      params: { roomId: ROOM_CODE },
    } as never);
    expect(response.status).toBe(503);
    expect(matchMakerMock.query).not.toHaveBeenCalled();
  });
});

describe('disposeRoom (host token)', () => {
  it('returns 401 when the bearer token is missing', async () => {
    const response = await disposeRoom({
      request: requestWith(`/api/v1/room/${ROOM_CODE}`, { method: 'DELETE' }),
      params: { roomId: ROOM_CODE },
    } as never);
    expect(response.status).toBe(401);
    expect(matchMakerMock.query).not.toHaveBeenCalled();
  });

  it('returns 403 for a wrong host token', async () => {
    stubFoundRoom({ hostToken: 'real-token' });
    const response = await disposeRoom({
      request: requestWith(`/api/v1/room/${ROOM_CODE}`, {
        method: 'DELETE',
        authorization: 'Bearer wrong-token',
      }),
      params: { roomId: ROOM_CODE },
    } as never);
    expect(response.status).toBe(403);
  });

  it('returns 410 Gone for an expired room even with a valid token', async () => {
    stubFoundRoom({ hostToken: 'real-token', expiresAt: PAST_EXPIRY });
    const response = await disposeRoom({
      request: requestWith(`/api/v1/room/${ROOM_CODE}`, {
        method: 'DELETE',
        authorization: 'Bearer real-token',
      }),
      params: { roomId: ROOM_CODE },
    } as never);
    expect(response.status).toBe(410);
  });

  it('disposes the room with a matching token and returns 204', async () => {
    const { broadcast } = stubFoundRoom({ hostToken: 'real-token' });
    const response = await disposeRoom({
      request: requestWith(`/api/v1/room/${ROOM_CODE}`, {
        method: 'DELETE',
        authorization: 'Bearer real-token',
      }),
      params: { roomId: ROOM_CODE },
    } as never);
    expect(response.status).toBe(204);
    expect(broadcast).toHaveBeenCalledWith('roomClosed');
  });

  it('returns 500 when lobby dispose throws', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    stubFoundRoom({ hostToken: 'real-token' });
    matchMakerMock.getLocalRoomById.mockReturnValue({
      state: createMatchState({ scenario: 'arena-01' }),
      broadcast: vi.fn(),
      disposeLobby: vi.fn().mockRejectedValue(new Error('boom')),
    });
    const response = await disposeRoom({
      request: requestWith(`/api/v1/room/${ROOM_CODE}`, {
        method: 'DELETE',
        authorization: 'Bearer real-token',
      }),
      params: { roomId: ROOM_CODE },
    } as never);
    try {
      expect(response.status).toBe(500);
    } finally {
      errorSpy.mockRestore();
    }
  });
});

describe('getRoom (expiry)', () => {
  it('returns 400 for a missing roomId', async () => {
    const response = await getRoom({
      request: requestWith(`/api/v1/room/`),
      params: {},
    } as never);
    expect(response.status).toBe(400);
    expect(matchMakerMock.query).not.toHaveBeenCalled();
  });

  it('returns 500 when the found room cache has no state', async () => {
    stubFoundRoom({});
    matchMakerMock.getLocalRoomById.mockReturnValue(undefined);
    const response = await getRoom({
      request: requestWith(`/api/v1/room/${ROOM_CODE}`),
      params: { roomId: ROOM_CODE },
    } as never);
    expect(response.status).toBe(500);
  });

  it('returns 410 Gone for an expired room', async () => {
    stubFoundRoom({ expiresAt: PAST_EXPIRY });
    const response = await getRoom({
      request: requestWith(`/api/v1/room/${ROOM_CODE}`),
      params: { roomId: ROOM_CODE },
    } as never);
    expect(response.status).toBe(410);
  });

  it('returns 200 with expiresAt on the snapshot for a live room', async () => {
    stubFoundRoom({ expiresAt: FUTURE_EXPIRY });
    const response = await getRoom({
      request: requestWith(`/api/v1/room/${ROOM_CODE}`),
      params: { roomId: ROOM_CODE },
    } as never);
    expect(response.status).toBe(200);
    const body = (await response.json()) as { expiresAt?: string };
    expect(body.expiresAt).toBe(FUTURE_EXPIRY);
  });
});

describe('createRoom (origin + host token)', () => {
  function roomCreateRequest(origin?: string, body = {}): Request {
    const headers = new Headers({ 'content-type': 'application/json' });
    if (origin) {
      headers.set('origin', origin);
    }
    return new Request('http://localhost:4321/api/v1/room', {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
  }

  it('rejects an invalid body with 400', async () => {
    const response = await createRoom({
      request: roomCreateRequest('http://localhost:4321', { scenario: 'not-a-map' }),
      params: {},
    } as never);
    expect(response.status).toBe(400);
    expect(matchMakerMock.createRoom).not.toHaveBeenCalled();
  });

  it('rejects a cross-origin create with 403', async () => {
    const response = await createRoom({
      request: roomCreateRequest('https://evil.example'),
      params: {},
    } as never);
    expect(response.status).toBe(403);
    expect(matchMakerMock.createRoom).not.toHaveBeenCalled();
  });

  it('creates a room with hostToken + expiresAt in metadata and response', async () => {
    matchMakerMock.createRoom.mockResolvedValue({});
    const response = await createRoom({
      request: roomCreateRequest('http://localhost:4321'),
      params: {},
    } as never);
    expect(response.status).toBe(201);
    const body = await response.json() as Record<string, string>;

    expect(typeof body.hostToken).toBe('string');
    expect(body.hostToken.length).toBeGreaterThan(0);
    expect(Number.isNaN(Date.parse(body.expiresAt))).toBe(false);

    const createCall = matchMakerMock.createRoom.mock.calls[0];
    expect(createCall[0]).toBe('match');
    const metadata = (createCall[1] as { metadata: Record<string, string> }).metadata;
    expect(metadata.roomCode).toMatch(/^[A-Z0-9]{6}$/);
    expect(metadata.hostToken).toBe(body.hostToken);
    expect(metadata.expiresAt).toBe(body.expiresAt);
  });

  it('allows an API client with no Origin header', async () => {
    matchMakerMock.createRoom.mockResolvedValue({});
    const response = await createRoom({
      request: roomCreateRequest(),
      params: {},
    } as never);
    expect(response.status).toBe(201);
  });
});

describe('claimSeat (origin)', () => {
  it('rejects a cross-origin seat claim with 403', async () => {
    const response = await claimSeat({
      request: requestWith(`/api/v1/room/${ROOM_CODE}`, {
        method: 'PUT',
        origin: 'https://evil.example',
      }),
      params: { roomId: ROOM_CODE },
    } as never);
    expect(response.status).toBe(403);
    expect(matchMakerMock.query).not.toHaveBeenCalled();
  });

  it('returns 409 when the room is not waiting', async () => {
    const { state } = stubFoundRoom({});
    state.roundPhase = 'in_progress';
    const response = await claimSeat({
      request: requestWith(`/api/v1/room/${ROOM_CODE}`, {
        method: 'PUT',
        body: JSON.stringify({ team: 'civilian', skin: 'remy' }),
      }),
      params: { roomId: ROOM_CODE },
    } as never);
    expect(response.status).toBe(409);
    expect(matchMakerMock.reserveSeatFor).not.toHaveBeenCalled();
  });

  it('returns 409 at maximum room capacity', async () => {
    const { state } = stubFoundRoom({ }, { clients: 2 });
    state.maxPerTeam = 1;
    const response = await claimSeat({
      request: requestWith(`/api/v1/room/${ROOM_CODE}`, {
        method: 'PUT',
        body: JSON.stringify({ team: 'civilian', skin: 'remy' }),
      }),
      params: { roomId: ROOM_CODE },
    } as never);
    expect(response.status).toBe(409);
    expect(matchMakerMock.reserveSeatFor).not.toHaveBeenCalled();
  });

  it('returns 409 when the seated team is full', async () => {
    const { state } = stubFoundRoom({});
    state.maxPerTeam = 1;
    state.players.set('existing', createPlayerState({ team: 'soldier' }));
    const response = await claimSeat({
      request: requestWith(`/api/v1/room/${ROOM_CODE}`, {
        method: 'PUT',
        body: JSON.stringify({ team: 'soldier', skin: 'swat-1' }),
      }),
      params: { roomId: ROOM_CODE },
    } as never);
    expect(response.status).toBe(409);
    expect(matchMakerMock.reserveSeatFor).not.toHaveBeenCalled();
  });

  it('returns 409 when reserveSeatFor throws a full-room error', async () => {
    stubFoundRoom({});
    matchMakerMock.reserveSeatFor.mockRejectedValue(new Error('Room is already full'));
    const response = await claimSeat({
      request: requestWith(`/api/v1/room/${ROOM_CODE}`, {
        method: 'PUT',
        body: JSON.stringify({ team: 'civilian', skin: 'remy' }),
      }),
      params: { roomId: ROOM_CODE },
    } as never);
    expect(response.status).toBe(409);
  });
});
