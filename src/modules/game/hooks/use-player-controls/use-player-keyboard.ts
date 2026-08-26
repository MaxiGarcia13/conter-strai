import type { RefObject } from 'react';
import { useEffect } from 'react';
import { cycleCameraMode } from '@/modules/game/state/player-state';
import { isMovePressed, MOVE_CODES, MOVE_KEY_CODES } from '@/modules/game/utils/move-codes';
import {
  cancelReload,
  requestJump,
  requestReload,
  toggleKneel,
} from '@/modules/game/utils/player-pose-actions';

interface UsePlayerKeyboardOptions {
  pressedCodesRef: RefObject<Set<string>>;
  eliminatedRef: RefObject<boolean>;
  externalControlsRef: RefObject<unknown>;
}

/** Discrete player actions (jump / kneel / reload / camera cycle). Tracking is shared. */
export function usePlayerKeyboard({
  pressedCodesRef,
  eliminatedRef,
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

      if (eliminatedRef.current) {
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
        toggleKneel(isMovePressed(pressed));
      } else if (event.code === MOVE_CODES.reload) {
        requestReload();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [pressedCodesRef, eliminatedRef, externalControlsRef]);
}
