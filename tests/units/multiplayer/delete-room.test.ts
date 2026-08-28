import { afterEach, describe, expect, it, vi } from 'vitest';
import { deleteRoom } from '@/modules/multiplayer/services/delete-room';
import { LobbyRestError } from '@/modules/multiplayer/services/lobby-rest';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('deleteRoom', () => {
  it('deletes the room with a bearer token and resolves on 204', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(deleteRoom('K7M2PQ', 'tok-123')).resolves.toBeUndefined();
    expect(fetchMock).toHaveBeenCalledWith('/api/v1/room/K7M2PQ', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer tok-123',
      },
    });
  });

  it('omits the bearer header when no host token is provided', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(deleteRoom('K7M2PQ')).resolves.toBeUndefined();
    expect(fetchMock).toHaveBeenCalledWith('/api/v1/room/K7M2PQ', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });
  });

  it('throws LobbyRestError on 401 (missing token)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ error: 'Missing host token' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    );

    const error = await deleteRoom('K7M2PQ').catch((cause: unknown) => cause);
    expect(error).toBeInstanceOf(LobbyRestError);
    expect(error).toMatchObject({ status: 401, message: 'Missing host token' });
  });

  it('throws LobbyRestError on 404', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ error: 'Room not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    );

    const error = await deleteRoom('ZZZZZZ').catch((cause: unknown) => cause);
    expect(error).toBeInstanceOf(LobbyRestError);
    expect(error).toMatchObject({ status: 404, message: 'Room not found' });
  });
});
