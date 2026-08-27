import type { RoundPhase } from '@/modules/game/types';
import type { MatchRoundPhase } from '@/modules/multiplayer/schema';

/** Map the authoritative server phase onto the client `RoundPhase`; `waiting` has no live equivalent. */
export function mapMatchRoundPhase(phase: MatchRoundPhase): RoundPhase | null {
  switch (phase) {
    case 'in_progress':
      return 'live';
    case 'ended':
      return 'round-end';
    default:
      return null;
  }
}
