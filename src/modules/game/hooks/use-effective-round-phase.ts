import type { RoundPhase } from '@/modules/game/types';
import type { Team } from '@/modules/teams';
import { useRoundStore } from '@/modules/game/stores/round-store';
import { useMultiplayerStore } from '@/modules/multiplayer/stores/multiplayer-store';

interface EffectiveRoundPhase {
  /** `null` while in a waiting multiplayer room; offline phase is always set. */
  phase: RoundPhase | null;
  /** 3|2|1 during countdown; null otherwise. */
  countdown: number | null;
  /** Server-declared winner in a match; local winner offline. */
  winner: Team | null;
}

/**
 * One authoritative round-phase resolution across offline and multiplayer.
 * In a live match (`connected` true) the server-driven multiplayer store owns
 * phase/countdown/winner; otherwise the offline round store does. `connected`
 * is preferred over roomId so live play is uniform for all callers — the
 * multiplayer store only becomes `connected` inside a room.
 */
export function useEffectiveRoundPhase(): EffectiveRoundPhase {
  const connected = useMultiplayerStore((state) => state.connected);
  const mpPhase = useMultiplayerStore((state) => state.phase);
  const mpCountdown = useMultiplayerStore((state) => state.countdown);
  const mpWinner = useMultiplayerStore((state) => state.winner);
  const roundPhase = useRoundStore((state) => state.phase);
  const roundCountdown = useRoundStore((state) => state.countdown);
  const roundWinner = useRoundStore((state) => state.winner);

  if (connected) {
    return { phase: mpPhase, countdown: mpCountdown, winner: mpWinner };
  }
  return { phase: roundPhase, countdown: roundCountdown, winner: roundWinner };
}
