import type { ScenarioId } from '@/modules/scenarios';
import { restartRound as restartMatchRound } from '@/modules/multiplayer/adapters/colyseus-adapter/match-session';
import { useRoundStore } from '../stores/round-store';

/**
 * Restart the current round. Multiplayer: host-only server restart re-enters
 * the deploy gate. Offline: local `startRound` runs the countdown directly.
 */
export function restartRound(connected: boolean, scenarioId?: ScenarioId): void {
  if (connected) {
    restartMatchRound();
    return;
  }

  useRoundStore.getState().startRound(scenarioId);
}
