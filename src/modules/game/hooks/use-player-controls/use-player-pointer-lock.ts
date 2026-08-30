import type { RefObject } from 'react';
import type { RoundPhase } from '@/modules/game/types';
import { useEffect, useRef } from 'react';
import { LOOK_PITCH_FLOOR, MOUSE_SENSITIVITY, PITCH_LIMIT } from '@/modules/game/constants/player';
import { useGamePauseStore } from '@/modules/game/stores/game-pause-store';
import { getPlayerTransform } from '@/modules/game/stores/player-state';
import { requestPointerLock } from '@/modules/game/utils/request-pointer-lock';
import { clamp } from '@/utils/clamp';

interface UsePlayerPointerLockOptions {
  domElement: HTMLElement;
  eliminated: boolean;
  eliminatedRef: RefObject<boolean>;
  paused: boolean;
  isPausedRef: RefObject<boolean>;
  phase: RoundPhase | null;
  phaseRef: RefObject<RoundPhase | null>;
  externalControlsRef: RefObject<unknown>;
}

function exitLock(
  domElement: HTMLElement,
  intentionalUnlockRef: RefObject<boolean>,
): void {
  if (document.pointerLockElement === domElement) {
    intentionalUnlockRef.current = true;
    document.exitPointerLock();
  }
}

/** Browser Esc exits pointer lock before keydown may reach the page — open pause on that unlock. */
export function shouldOpenPauseOnPointerUnlock(options: {
  wasIntentionalUnlock: boolean;
  suppressResumeUnlock: boolean;
  eliminated: boolean;
  phase: RoundPhase | null;
  isPaused: boolean;
}): boolean {
  return (
    !options.wasIntentionalUnlock
    && !options.suppressResumeUnlock
    && !options.eliminated
    && options.phase === 'live'
    && !options.isPaused
  );
}

/** Click-to-lock pointer look; pause / round-end release lock (pre-US-10 mouse capture). */
export function usePlayerPointerLock({
  domElement,
  eliminated,
  eliminatedRef,
  paused,
  isPausedRef,
  phase,
  phaseRef,
  externalControlsRef,
}: UsePlayerPointerLockOptions): void {
  const intentionalUnlockRef = useRef(false);
  const suppressUnlockPauseRef = useRef(false);
  const phaseValue = phase;
  phaseRef.current = phaseValue;

  useEffect(() => {
    if (eliminated || paused || phase === 'round-end') {
      suppressUnlockPauseRef.current = true;
      exitLock(domElement, intentionalUnlockRef);
      requestAnimationFrame(() => {
        suppressUnlockPauseRef.current = false;
      });
    }
  }, [eliminated, paused, phase, domElement]);

  useEffect(() => {
    const requestLock = () => {
      if (
        eliminatedRef.current
        || externalControlsRef.current
        || isPausedRef.current
        || phaseRef.current === 'round-end'
      ) {
        return;
      }
      requestPointerLock(domElement);
    };

    const onPointerLockChange = () => {
      if (document.pointerLockElement === domElement) {
        return;
      }

      const wasIntentional = intentionalUnlockRef.current;
      intentionalUnlockRef.current = false;

      if (
        shouldOpenPauseOnPointerUnlock({
          wasIntentionalUnlock: wasIntentional,
          suppressResumeUnlock: suppressUnlockPauseRef.current,
          eliminated: eliminatedRef.current,
          phase: phaseRef.current,
          isPaused: useGamePauseStore.getState().isPaused,
        })
      ) {
        useGamePauseStore.getState().setPaused(true);
      }
    };

    const onMouseMove = (event: MouseEvent) => {
      if (
        document.pointerLockElement !== domElement
        || isPausedRef.current
        || eliminatedRef.current
        || externalControlsRef.current
      ) {
        return;
      }

      const look = getPlayerTransform();
      look.yaw -= event.movementX * MOUSE_SENSITIVITY;

      const pitch = clamp(look.pitch - event.movementY * MOUSE_SENSITIVITY, -PITCH_LIMIT, PITCH_LIMIT);
      if (pitch >= LOOK_PITCH_FLOOR) {
        look.pitch = pitch;
      }
    };

    domElement.addEventListener('click', requestLock);
    document.addEventListener('pointerlockchange', onPointerLockChange);
    document.addEventListener('mousemove', onMouseMove);

    return () => {
      domElement.removeEventListener('click', requestLock);
      document.removeEventListener('pointerlockchange', onPointerLockChange);
      document.removeEventListener('mousemove', onMouseMove);
    };
  }, [domElement, eliminatedRef, isPausedRef, phaseRef, externalControlsRef]);
}
