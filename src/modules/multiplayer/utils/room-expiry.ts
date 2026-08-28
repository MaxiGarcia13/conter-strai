import { ROOM_CODE_TTL_MS } from '../constants/room-ttl';

/** ISO timestamp a newly created room expires at (create + TTL). */
export function computeExpiresAt(now = Date.now()): string {
  return new Date(now + ROOM_CODE_TTL_MS).toISOString();
}

/** True when an ISO `expiresAt` is in the past; invalid/missing means not expired. */
export function isRoomExpired(expiresAt: string | undefined): boolean {
  if (!expiresAt) {
    return false;
  }
  const time = Date.parse(expiresAt);
  return !Number.isNaN(time) && time <= Date.now();
}

/** Throws when a WebSocket join arrives after the room code TTL. */
export function assertRoomJoinable(expiresAt: string | undefined): void {
  if (isRoomExpired(expiresAt)) {
    throw new Error('Room expired');
  }
}
