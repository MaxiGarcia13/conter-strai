import type { RefObject } from 'react';
import type { RoundPhase } from '@/modules/game/types';
import { useEffect, useRef } from 'react';
import { applyLookDelta } from '@/modules/game/input/utils/apply-look-delta';
import { isTouchPrimaryDevice } from '@/modules/game/input/utils/is-touch-primary-device';
import { useGamePauseStore } from '@/modules/game/stores/game-pause-store';
import { requestPointerLock } from '@/modules/game/utils/request-pointer-lock';

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

/** Click-to-lock pointer look on desktop; no lock request on touch-primary. Pause / round-end release lock. */
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
        isTouchPrimaryDevice()
        || eliminatedRef.current
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

      applyLookDelta(event.movementX, event.movementY);
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
