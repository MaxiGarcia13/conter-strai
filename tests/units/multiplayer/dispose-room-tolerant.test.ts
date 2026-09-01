import { afterEach, describe, expect, it, vi } from 'vitest';
import { disposeRoomTolerant } from '@/modules/multiplayer/services/dispose-room-tolerant';
import { LobbyRestError } from '@/modules/multiplayer/services/lobby-rest';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('disposeRoomTolerant', () => {
  it('resolves on a successful 204 delete', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 204 })));

    await expect(disposeRoomTolerant('K7M2PQ', 'tok-123')).resolves.toBeUndefined();
  });

  it('swallows a 404 as if the room were already gone', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ error: 'Room not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    );

    await expect(disposeRoomTolerant('ZZZZZZ')).resolves.toBeUndefined();
  });

  it('rethrows a LobbyRestError for other statuses (401)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ error: 'Missing host token' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    );

    const error = await disposeRoomTolerant('K7M2PQ').catch((cause: unknown) => cause);
    expect(error).toBeInstanceOf(LobbyRestError);
    expect(error).toMatchObject({ status: 401 });
  });

  it('rethrows network failures', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));

    await expect(disposeRoomTolerant('K7M2PQ')).rejects.toBeInstanceOf(TypeError);
  });
});
