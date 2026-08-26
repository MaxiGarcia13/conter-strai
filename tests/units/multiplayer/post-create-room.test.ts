import { afterEach, describe, expect, it, vi } from 'vitest';
import { LobbyRestError } from '@/modules/multiplayer/services/lobby-rest';
import {
  postCreateRoom,
  readCreatedRoomId,
} from '@/modules/multiplayer/services/post-create-room';

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

describe('readCreatedRoomId', () => {
  it('accepts a 6-character snapshot id', () => {
    expect(readCreatedRoomId({ id: 'ABC123' })).toBe('ABC123');
  });

  it('rejects missing or short ids', () => {
    expect(readCreatedRoomId(null)).toBeNull();
    expect(readCreatedRoomId({})).toBeNull();
    expect(readCreatedRoomId({ id: 'AB' })).toBeNull();
  });
});

describe('postCreateRoom', () => {
  it('posts options and returns the server room id', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(201, { id: 'K7M2PQ' }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(
      postCreateRoom({ team: 'civilian', skin: 'remy', scenario: 'arena-01' }),
    ).resolves.toBe('K7M2PQ');

    expect(fetchMock).toHaveBeenCalledWith('/api/v1/room', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ team: 'civilian', skin: 'remy', scenario: 'arena-01' }),
    });
  });

  it('throws LobbyRestError on 503', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        jsonResponse(503, { error: 'Matchmaker is not ready' }),
      ),
    );

    const error = await postCreateRoom({}).catch((cause: unknown) => cause);
    expect(error).toBeInstanceOf(LobbyRestError);
    expect(error).toMatchObject({ status: 503, message: 'Matchmaker is not ready' });
  });
});
