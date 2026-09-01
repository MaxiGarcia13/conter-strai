import type { MatchState } from '../schema/match-state';

export interface MatchCountdown {
  begin: (fromSeconds: number) => void;
  clear: () => void;
}

/**
 * Owns the round countdown interval. `begin` sets the phase to `countdown` and
 * ticks the shared state down each interval, flipping to `in_progress` at zero.
 */
export function createMatchCountdown(
  state: MatchState,
  tickMs = 1_000,
): MatchCountdown {
  let timer: ReturnType<typeof setInterval> | null = null;

  function clear() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  function begin(fromSeconds: number) {
    clear();
    state.countdown = fromSeconds;
    state.roundPhase = 'countdown';
    timer = setInterval(() => {
      if (state.roundPhase !== 'countdown') {
        clear();
        return;
      }
      if (state.countdown <= 1) {
        clear();
        state.countdown = 0;
        state.roundPhase = 'in_progress';
        return;
      }
      state.countdown -= 1;
    }, tickMs);
  }

  return { begin, clear };
}
