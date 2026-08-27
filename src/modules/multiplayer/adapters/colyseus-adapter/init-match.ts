import type { InitMatchOptions, MatchHandle } from './types';
import { MatchStateSchema } from '@/modules/multiplayer/schema';
import { getActiveMatch, setActiveMatch } from './active-match';
import { buildMatchHandle } from './build-match-handle';
import { defaultEndpoint } from './default-endpoint';

/**
 * Connect to a match: reconnect after a hard navigation, consume a reserved
 * seat (from `PUT /api/v1/room/{id}`), or `joinById` the Colyseus room.
 * Any previous match is left before joining a different one.
 */
export async function initMatch(options: InitMatchOptions): Promise<MatchHandle> {
  const previous = getActiveMatch();
  if (previous) {
    const sameRoom = previous.roomId === options.roomId
      || previous.roomId === options.reservation?.roomId
      || (options.reconnectionToken?.startsWith(`${previous.roomId}:`) ?? false);
    if (sameRoom) {
      return previous;
    }
    await previous.leave();
    setActiveMatch(null);
  }

  const endpoint = options.endpoint ?? defaultEndpoint();
  const { Client } = await import('@colyseus/sdk');
  const client = new Client(endpoint);

  const room = options.reconnectionToken
    ? await client.reconnect(options.reconnectionToken, MatchStateSchema)
    : options.reservation
      ? await client.consumeSeatReservation(options.reservation, MatchStateSchema)
      : await client.joinById(options.roomId, options.options, MatchStateSchema);

  return buildMatchHandle(room);
}
