import type { Team } from '@/modules/teams';
import { useEffect } from 'react';
import { getActiveMatch } from '@/modules/multiplayer/adapters/colyseus-adapter';
import { isE2e } from '@/modules/multiplayer/dev/is-e2e';

declare global {
  interface Window {
    /** Playwright write API — available when `PUBLIC_E2E=true`. */
    __PLAY_TEST_API__?: {
      endRound: (winner?: Team) => void;
      /** True once the server round is `in_progress` (countdown finished). */
      isRoundLive: () => boolean;
    };
  }
}

/** Registers the play-test write API on `/play` (no R3F probe). */
export function E2eMatchBridge() {
  useEffect(() => {
    if (!isE2e()) {
      return;
    }

    void import('@/modules/game/components/game-pause-panel/game-pause-panel');
    void import('@/modules/game/components/round-end-banner/round-end-banner');

    window.__PLAY_TEST_API__ = {
      endRound: (winner = 'civilian') => {
        getActiveMatch()?.room.send('e2eEndRound', { winner });
      },
      isRoundLive: () => getActiveMatch()?.room.state?.roundPhase === 'in_progress',
    };

    return () => {
      delete window.__PLAY_TEST_API__;
    };
  }, []);

  return null;
}
