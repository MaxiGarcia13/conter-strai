import { useThree } from '@react-three/fiber';

import { useEffect } from 'react';

import { countActiveSoldierMixers as countLocomotionMixers } from '@/modules/soldiers/hooks/use-soldier-locomotion';
import { SOLDIER_ROOT_NAME } from '@/modules/soldiers/utils/clone-soldier-root';
import { getPlayerLocomotion } from '../state/player-state';

const POLL_INTERVAL_MS = 250;

/** Diagnostic snapshot polled by Playwright when the build runs with E2E=true. */
export interface PlayTestSnapshot {
  /** Soldier armature roots in the scene graph (includes hidden FPS body). */
  soldierCount: number;
  mixerReady: boolean;
  activeClip: string;
}

declare global {
  interface Window {
    __PLAY_TEST__?: PlayTestSnapshot;
  }
}

export function PlayTestHook() {
  const scene = useThree((state) => state.scene);

  useEffect(() => {
    const update = () => {
      let soldierCount = 0;
      scene.traverse((object) => {
        if (object.name === SOLDIER_ROOT_NAME) {
          soldierCount += 1;
        }
      });
      window.__PLAY_TEST__ = {
        soldierCount,
        mixerReady: countLocomotionMixers() > 0,
        activeClip: getPlayerLocomotion(),
      };
    };
    update();
    const timer = window.setInterval(update, POLL_INTERVAL_MS);
    return () => {
      window.clearInterval(timer);
      delete window.__PLAY_TEST__;
    };
  }, [scene]);

  return null;
}
