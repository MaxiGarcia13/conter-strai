import type { SeatReservation } from '../types';
import type { MatchHandle } from '@/modules/multiplayer/adapters/colyseus-adapter';
import { useEffect, useState } from 'react';
import { readRoomSession, writeRoomSession } from '@/modules/lobby/utils/room-session';
import {
  getActiveMatch,
  initMatch,
} from '@/modules/multiplayer/adapters/colyseus-adapter';
import { bindMatch } from '@/modules/multiplayer/services/bind-match';
import { putClaimSeat } from '@/modules/multiplayer/services/put-claim-seat';

export interface MatchJoinState {
  joining: boolean;
  error: string | null;
}

/** Serializes seat claims so StrictMode double-effects cannot reserve twice. */
const pendingReservations = new Map<string, Promise<SeatReservation | null>>();

/** One bind per room — remounting waiting→play must not stack listeners. */
const boundByRoom = new Map<string, () => void>();

function isExpiredSeatError(cause: unknown): boolean {
  const message = cause instanceof Error ? cause.message : String(cause);
  return /seat reservation expired|522/i.test(message);
}

async function resolveReservation(roomId: string): Promise<SeatReservation | null> {
  const session = readRoomSession(roomId);
  if (!session) {
    return null;
  }

  const inFlight = pendingReservations.get(roomId);
  if (inFlight) {
    return inFlight;
  }

  const claim = (async () => {
    const sessionNow = readRoomSession(roomId);
    if (!sessionNow) {
      return null;
    }
    // Never reuse a reservation after it was consumed — claim a fresh one.
    const claimed = await putClaimSeat(roomId, { team: sessionNow.team, skin: sessionNow.skin });
    writeRoomSession(roomId, {
      ...sessionNow,
      reservation: claimed.reservation,
      reconnectionToken: undefined,
    });
    return claimed.reservation;
  })().finally(() => {
    pendingReservations.delete(roomId);
  });

  pendingReservations.set(roomId, claim);
  return claim;
}

function bindRoomMatch(roomId: string, handle: MatchHandle): void {
  boundByRoom.get(roomId)?.();
  boundByRoom.set(roomId, bindMatch(handle));
}

/** Persist reconnect token; drop the consumed seat reservation. */
function persistAfterJoin(roomId: string, handle: MatchHandle): void {
  const session = readRoomSession(roomId);
  if (!session) {
    return;
  }
  writeRoomSession(roomId, {
    ...session,
    reservation: undefined,
    reconnectionToken: handle.reconnectionToken,
  });
}

async function reconnectWithRetry(reconnectionToken: string): Promise<MatchHandle> {
  let lastError: unknown;
  for (let attempt = 0; attempt < 8; attempt++) {
    try {
      return await initMatch({
        roomId: reconnectionToken.split(':')[0] ?? '',
        reconnectionToken,
      });
    } catch (cause) {
      lastError = cause;
      await new Promise((resolve) => {
        setTimeout(resolve, 200 * (attempt + 1));
      });
    }
  }
  throw lastError instanceof Error
    ? lastError
    : new Error('Could not reconnect to match.');
}

function toJoinError(cause: unknown): string {
  if (isExpiredSeatError(cause)) {
    return 'Match connection expired. Create a new room to play again.';
  }
  return cause instanceof Error ? cause.message : 'Could not connect to match.';
}

/**
 * Joins (or reconnects to) the Colyseus match. Prefer an existing in-memory
 * handle, then `reconnectionToken` after hard navigations, then a fresh seat
 * claim. Re-binds store listeners without stacking them.
 */
export function useMatchJoin(roomId: string): MatchJoinState {
  const [joining, setJoining] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setJoining(true);
    setError(null);

    (async () => {
      try {
        const existing = getActiveMatch();
        if (existing) {
          if (!cancelled) {
            bindRoomMatch(roomId, existing);
            persistAfterJoin(roomId, existing);
          }
          return;
        }

        const session = readRoomSession(roomId);
        if (!session) {
          if (!cancelled) {
            setError('No session stored for this room.');
          }
          return;
        }

        if (session.reconnectionToken) {
          try {
            const handle = await reconnectWithRetry(session.reconnectionToken);
            if (cancelled) {
              return;
            }
            persistAfterJoin(roomId, handle);
            bindRoomMatch(roomId, handle);
            return;
          } catch (cause) {
            writeRoomSession(roomId, {
              ...session,
              reconnectionToken: undefined,
              reservation: undefined,
            });
            // Room is likely locked / mid-match — a new seat claim will not work.
            if (!cancelled) {
              setError(toJoinError(cause));
            }
            return;
          }
        }

        const reservation = await resolveReservation(roomId);
        if (cancelled) {
          return;
        }
        if (!reservation) {
          setError('No session stored for this room.');
          return;
        }
        const handle = await initMatch({ roomId: reservation.roomId, reservation });
        if (cancelled) {
          return;
        }
        persistAfterJoin(roomId, handle);
        bindRoomMatch(roomId, handle);
      } catch (cause) {
        if (!cancelled) {
          setError(toJoinError(cause));
        }
      } finally {
        if (!cancelled) {
          setJoining(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [roomId]);

  return { joining, error };
}
