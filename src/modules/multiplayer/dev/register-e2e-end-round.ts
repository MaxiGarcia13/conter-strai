import type { Client } from 'colyseus';
import type { MatchState } from '../schema/match-state';
import type { Team } from '@/modules/teams/types';
import { isE2e } from './is-e2e';

interface E2eEndRoundRoom {
  state: MatchState;
  getHostSessionId: () => string | null;
  onMessage: (type: string, callback: (client: Client, data: unknown) => void) => void;
  broadcast: (type: string, message: { winner: Team }) => void;
}

/** Playwright: end a live round without gameplay shooting. */
export function registerE2eEndRound(room: E2eEndRoundRoom): void {
  if (!isE2e()) {
    return;
  }

  room.onMessage('e2eEndRound', (client, data) => {
    const payload = data as { winner?: string };
    if (
      client.sessionId !== room.getHostSessionId()
      || room.state.roundPhase !== 'in_progress'
    ) {
      return;
    }
    const winner: Team = payload.winner === 'soldier' ? 'soldier' : 'civilian';
    room.state.winner = winner;
    room.state.roundPhase = 'ended';
    room.broadcast('roundEnd', { winner });
  });
}
