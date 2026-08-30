import type { Team } from '@/modules/teams';
import { useEffect } from 'react';
import { getActiveMatch } from '@/modules/multiplayer/adapters/colyseus-adapter';
import { isE2e } from '@/modules/multiplayer/dev/is-e2e';

declare global {
  interface Window {
    /** Playwright write API — available when `PUBLIC_E2E=true`. */
    __PLAY_TEST_API__?: {
      endRound: (winner?: Team) => void;
    };
  }
}

/** Registers the play-test write API on `/play` (no R3F probe). */
export function E2eMatchBridge() {
  useEffect(() => {
    if (!isE2e()) {
      return;
    }

    window.__PLAY_TEST_API__ = {
      endRound: (winner = 'civilian') => {
        getActiveMatch()?.room.send('e2eEndRound', { winner });
      },
    };

    return () => {
      delete window.__PLAY_TEST_API__;
    };
  }, []);

  return null;
}
