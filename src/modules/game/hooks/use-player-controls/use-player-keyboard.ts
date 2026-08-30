import type { RefObject } from 'react';
import type { RoundPhase } from '@/modules/game/types';
import { useEffect } from 'react';
import { GAME_BINDINGS, MOVE_CODES, MOVE_KEY_CODES } from '@/modules/game/constants/game-bindings';
import { useGamePauseStore } from '@/modules/game/stores/game-pause-store';
import { cycleCameraMode } from '@/modules/game/stores/player-state';
import {
  cancelReload,
  requestJump,
  requestReload,
  toggleKneel,
} from '@/modules/game/utils/player-pose-actions';

interface UsePlayerKeyboardOptions {
  pressedCodesRef: RefObject<Set<string>>;
  eliminatedRef: RefObject<boolean>;
  isPausedRef: RefObject<boolean>;
  phaseRef: RefObject<RoundPhase | null>;
  externalControlsRef: RefObject<unknown>;
}

/** Discrete player actions (jump / kneel / reload / camera cycle) + pause toggle. */
export function usePlayerKeyboard({
  pressedCodesRef,
  eliminatedRef,
  isPausedRef,
  phaseRef,
  externalControlsRef,
}: UsePlayerKeyboardOptions): void {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      // Dev tools (e.g. free-cam) register R3F controls while they own input.
      if (externalControlsRef.current) {
        return;
      }

      if (event.repeat) {
        return;
      }

      // Esc toggles pause while live only (US-9.3).
      if (event.code === GAME_BINDINGS.pause.code) {
        if (!eliminatedRef.current && phaseRef.current === 'live') {
          useGamePauseStore.getState().togglePause();
        }
        return;
      }

      if (eliminatedRef.current || isPausedRef.current) {
        return;
      }

      const pressed = pressedCodesRef.current;
      if (!pressed) {
        return;
      }

      if ((MOVE_KEY_CODES as readonly string[]).includes(event.code)) {
        cancelReload();
      }

      if (event.code === MOVE_CODES.cameraCycle) {
        cycleCameraMode();
      } else if (event.code === MOVE_CODES.jump) {
        requestJump();
      } else if (event.code === MOVE_CODES.kneelToggle) {
        toggleKneel();
      } else if (event.code === MOVE_CODES.reload) {
        requestReload();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [pressedCodesRef, eliminatedRef, isPausedRef, phaseRef, externalControlsRef]);
}
