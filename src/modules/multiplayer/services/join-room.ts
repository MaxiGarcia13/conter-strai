import type { ClaimSeatResponse, SeatClaimOptions } from '../types';
import { getRoomSnapshot } from './get-room-snapshot';
import { LobbyRestError } from './lobby-rest';
import { putClaimSeat } from './put-claim-seat';

/** GET snapshot then PUT seat before navigating to waiting / play. */
export async function joinRoom(
  roomId: string,
  claim: SeatClaimOptions,
): Promise<ClaimSeatResponse> {
  const snapshot = await getRoomSnapshot(roomId);
  if (!snapshot.canJoin) {
    throw new LobbyRestError(
      409,
      snapshot.phase === 'waiting' ? 'Room is at maximum capacity' : 'Room is not in waiting phase',
    );
  }
  if (!snapshot.teams[claim.team].open) {
    throw new LobbyRestError(409, 'Team is full');
  }
  return putClaimSeat(roomId, claim);
}
