import type { RefObject } from 'react';
import type { RoundPhase } from '@/modules/game/types';
import { useEffect, useRef } from 'react';
import { LOOK_PITCH_FLOOR, MOUSE_SENSITIVITY, PITCH_LIMIT } from '@/modules/game/constants/player';
import { useGamePauseStore } from '@/modules/game/state/game-pause-store';
import { getPlayerTransform, isLookEnabled, setLookEnabled } from '@/modules/game/state/player-state';
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

function setGameCursorCaptured(captured: boolean): void {
  document.getElementById('game-canvas')?.classList.toggle('cursor-none', captured);
}

function releaseLook(
  domElement: HTMLElement,
  intentionalUnlockRef: RefObject<boolean>,
): void {
  setLookEnabled(false);
  setGameCursorCaptured(false);
  if (document.pointerLockElement === domElement) {
    intentionalUnlockRef.current = true;
    document.exitPointerLock();
  }
}

function engageLook(domElement: HTMLElement): void {
  setLookEnabled(true);
  setGameCursorCaptured(true);
  requestPointerLock(domElement);
}

/** Browser Esc exits pointer lock before keydown may reach the page — open pause on that unlock. */
export function shouldOpenPauseOnPointerUnlock(options: {
  wasIntentionalUnlock: boolean;
  suppressResumeUnlock: boolean;
  lookEnabled: boolean;
  eliminated: boolean;
  phase: RoundPhase | null;
  isPaused: boolean;
}): boolean {
  return (
    !options.wasIntentionalUnlock
    && !options.suppressResumeUnlock
    && options.lookEnabled
    && !options.eliminated
    && options.phase === 'live'
    && !options.isPaused
  );
}

/** Document mouse look; Esc opens pause (keyboard hook + pointer-unlock fallback). */
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
      releaseLook(domElement, intentionalUnlockRef);
      return;
    }

    // Defer re-lock so the same Esc that closes pause does not lock-then-unlock and reopen it.
    suppressUnlockPauseRef.current = true;
    const resumeFrame = requestAnimationFrame(() => {
      if (useGamePauseStore.getState().isPaused) {
        suppressUnlockPauseRef.current = false;
        return;
      }
      engageLook(domElement);
      requestAnimationFrame(() => {
        suppressUnlockPauseRef.current = false;
      });
    });

    return () => {
      cancelAnimationFrame(resumeFrame);
    };
  }, [eliminated, paused, phase, domElement]);

  useEffect(() => {
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
          lookEnabled: isLookEnabled(),
          eliminated: eliminatedRef.current,
          phase: phaseRef.current,
          isPaused: useGamePauseStore.getState().isPaused,
        })
      ) {
        useGamePauseStore.getState().setPaused(true);
      }

      if (isLookEnabled()) {
        releaseLook(domElement, intentionalUnlockRef);
      }
    };

    const onClick = () => {
      if (
        eliminatedRef.current
        || externalControlsRef.current
        || isPausedRef.current
        || isLookEnabled()
        || phaseRef.current === 'round-end'
      ) {
        return;
      }
      engageLook(domElement);
    };

    const onMouseMove = (event: MouseEvent) => {
      if (
        !isLookEnabled()
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

    domElement.addEventListener('click', onClick);
    document.addEventListener('pointerlockchange', onPointerLockChange);
    document.addEventListener('mousemove', onMouseMove);

    return () => {
      domElement.removeEventListener('click', onClick);
      document.removeEventListener('pointerlockchange', onPointerLockChange);
      document.removeEventListener('mousemove', onMouseMove);
    };
  }, [domElement, eliminatedRef, isPausedRef, phaseRef, externalControlsRef]);
}
