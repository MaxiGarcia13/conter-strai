import { afterEach, describe, expect, it, vi } from 'vitest';
import { LobbyRestError } from '@/modules/multiplayer/services/lobby-rest';
import {
  postCreateRoom,
  readCreatedRoom,
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

describe('readCreatedRoom', () => {
  it('accepts a 6-character snapshot id with a host token', () => {
    expect(readCreatedRoom({ id: 'ABC123', hostToken: 'tok' })).toEqual({
      roomId: 'ABC123',
      hostToken: 'tok',
    });
  });

  it('rejects missing or short ids', () => {
    expect(readCreatedRoom(null)).toBeNull();
    expect(readCreatedRoom({})).toBeNull();
    expect(readCreatedRoom({ id: 'AB' })).toBeNull();
  });

  it('rejects a missing host token', () => {
    expect(readCreatedRoom({ id: 'ABC123' })).toBeNull();
  });
});

describe('postCreateRoom', () => {
  it('posts options and returns the server room id + host token', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(jsonResponse(201, { id: 'K7M2PQ', hostToken: 'tok-123' }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(
      postCreateRoom({ team: 'civilian', skin: 'remy', scenario: 'arena-01' }),
    ).resolves.toEqual({ roomId: 'K7M2PQ', hostToken: 'tok-123' });

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

  it('throws when the create response has no host token', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(jsonResponse(201, { id: 'K7M2PQ' })),
    );

    const error = await postCreateRoom({}).catch((cause: unknown) => cause);
    expect(error).toBeInstanceOf(LobbyRestError);
    expect(error).toMatchObject({ status: 500, message: 'Invalid create-room response' });
  });
});
