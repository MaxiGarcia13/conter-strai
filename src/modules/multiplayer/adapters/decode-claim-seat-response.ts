import type { ClaimSeatResponse, SeatReservation } from '../types';
import { decodeRoomSnapshot } from './decode-room-snapshot';

function decodeSeatReservation(value: unknown): SeatReservation | null {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }
  const body = value as Record<string, unknown>;
  if (typeof body.name !== 'string' || typeof body.sessionId !== 'string' || typeof body.roomId !== 'string') {
    return null;
  }

  const reservation: SeatReservation = {
    name: body.name,
    sessionId: body.sessionId,
    roomId: body.roomId,
  };
  if (typeof body.publicAddress === 'string') {
    reservation.publicAddress = body.publicAddress;
  }
  if (typeof body.processId === 'string') {
    reservation.processId = body.processId;
  }
  if (typeof body.reconnectionToken === 'string') {
    reservation.reconnectionToken = body.reconnectionToken;
  }
  if (typeof body.devMode === 'boolean') {
    reservation.devMode = body.devMode;
  }
  return reservation;
}

/** Decode PUT seat-claim JSON `{ snapshot, reservation }`, or `null` if invalid. */
export function decodeClaimSeatResponse(value: unknown): ClaimSeatResponse | null {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }
  const body = value as Record<string, unknown>;
  const snapshot = decodeRoomSnapshot(body.snapshot);
  const reservation = decodeSeatReservation(body.reservation);
  if (!snapshot || !reservation) {
    return null;
  }
  return { snapshot, reservation };
}
