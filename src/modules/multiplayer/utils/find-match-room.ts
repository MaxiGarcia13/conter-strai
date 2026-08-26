import type { Room } from 'colyseus';
import type { MatchState } from '../schema/match-state';
import { matchMaker } from 'colyseus';

type RoomCache = Awaited<ReturnType<typeof matchMaker.query>>[number];

export interface MatchRoomLookup {
  roomCache: RoomCache;
  room: Room | undefined;
  state: MatchState | undefined;
}

/** Resolve a public 6-char `roomCode` to the in-process Colyseus match room. */
export async function findMatchRoomByCode(roomCode: string): Promise<MatchRoomLookup | null> {
  const rooms = await matchMaker.query({ name: 'match' });
  const roomCache = rooms.find((cached) => cached.metadata?.roomCode === roomCode);
  if (!roomCache) {
    return null;
  }

  const room = matchMaker.getLocalRoomById(roomCache.roomId) as Room | undefined;
  return {
    roomCache,
    room,
    state: room?.state as MatchState | undefined,
  };
}
