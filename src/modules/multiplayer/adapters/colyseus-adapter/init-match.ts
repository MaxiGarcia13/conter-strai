import type { InitMatchOptions, MatchHandle } from './types';
import { MatchStateSchema } from '@/modules/multiplayer/schema';
import { getActiveMatch, setActiveMatch } from './active-match';
import { buildMatchHandle } from './build-match-handle';
import { defaultEndpoint } from './default-endpoint';

/**
 * Connect to a match: consume a reserved seat (from `PUT /api/v1/room/{id}`)
 * or `joinById` the Colyseus room directly (host after create). Any previous
 * match is left before joining the new one.
 */
export async function initMatch(options: InitMatchOptions): Promise<MatchHandle> {
  const previous = getActiveMatch();
  if (previous) {
    await previous.leave();
    setActiveMatch(null);
  }

  const endpoint = options.endpoint ?? defaultEndpoint();
  const { Client } = await import('@colyseus/sdk');
  const client = new Client(endpoint);

  const room = options.reservation
    ? await client.consumeSeatReservation(options.reservation, MatchStateSchema)
    : await client.joinById(options.roomId, options.options, MatchStateSchema);

  return buildMatchHandle(room);
}
