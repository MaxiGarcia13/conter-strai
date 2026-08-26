import { afterEach, describe, expect, it, vi } from 'vitest';
import { createEmptyRoomSnapshot } from '@/modules/multiplayer/adapters/to-room-snapshot';
import { joinRoom } from '@/modules/multiplayer/services/join-room';
import { LobbyRestError } from '@/modules/multiplayer/services/lobby-rest';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

const SNAPSHOT = createEmptyRoomSnapshot('K7M2PQ', 'arena-01');
const RESERVATION = {
  name: 'match',
  sessionId: 'sess-1',
  roomId: 'colyseus-room',
};

describe('joinRoom', () => {
  it('gets a snapshot then puts a seat claim', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(jsonResponse(200, SNAPSHOT))
      .mockResolvedValueOnce(jsonResponse(200, { snapshot: SNAPSHOT, reservation: RESERVATION }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(joinRoom('K7M2PQ', { team: 'civilian', skin: 'remy' })).resolves.toEqual({
      snapshot: SNAPSHOT,
      reservation: RESERVATION,
    });

    expect(fetchMock).toHaveBeenNthCalledWith(1, '/api/v1/room/K7M2PQ');
    expect(fetchMock).toHaveBeenNthCalledWith(2, '/api/v1/room/K7M2PQ', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ team: 'civilian', skin: 'remy' }),
    });
  });

  it('throws 404 without putting a seat', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(404, { error: 'Room not found' }));
    vi.stubGlobal('fetch', fetchMock);

    const error = await joinRoom('ZZZZZZ', { team: 'civilian', skin: 'remy' }).catch((cause: unknown) => cause);
    expect(error).toBeInstanceOf(LobbyRestError);
    expect(error).toMatchObject({ status: 404, message: 'Room not found' });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('throws 409 when the snapshot is not joinable', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse(200, { ...SNAPSHOT, phase: 'in_progress', canJoin: false }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const error = await joinRoom('K7M2PQ', { team: 'civilian', skin: 'remy' }).catch((cause: unknown) => cause);
    expect(error).toMatchObject({ status: 409, message: 'Room is not in waiting phase' });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
