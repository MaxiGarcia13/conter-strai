import { isE2e } from '../dev/is-e2e';

export interface MatchExpiryOptions {
  /** Linger after `expiresAt` so REST can return 410 before the room is gone. */
  graceMs?: number;
  /** Called after the grace window elapses — broadcast `roomClosed` + dispose. */
  onExpired: () => void;
}

export interface MatchExpiry {
  schedule: (expiresAt?: string) => void;
  cancel: () => void;
}

/**
 * Owns the room-code TTL timer. Auto-disposes the match after `expiresAt`
 * plus a grace window (skipped while the E2E harness asserts REST 410). Call
 * `schedule` with the fresh `expiresAt` on create and each renew.
 */
export function scheduleMatchExpiry(options: MatchExpiryOptions): MatchExpiry {
  const graceMs = options.graceMs ?? 1_000;
  let timer: ReturnType<typeof setTimeout> | null = null;

  function cancel() {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  }

  function schedule(expiresAt?: string) {
    cancel();
    if (isE2e()) {
      return;
    }
    const expiresAtMs = expiresAt ? Date.parse(expiresAt) : Number.NaN;
    if (Number.isNaN(expiresAtMs)) {
      return;
    }
    const delay = expiresAtMs + graceMs - Date.now();
    if (delay <= 0) {
      options.onExpired();
      return;
    }
    timer = setTimeout(() => {
      timer = null;
      options.onExpired();
    }, delay);
  }

  return { schedule, cancel };
}
