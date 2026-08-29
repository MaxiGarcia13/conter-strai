import type { RefObject } from 'react';
import { useEffect, useRef } from 'react';
import { LOOK_PITCH_FLOOR, MOUSE_SENSITIVITY, PITCH_LIMIT } from '@/modules/game/constants/player';
import { getPlayerTransform, isLookEnabled, setLookEnabled } from '@/modules/game/state/player-state';
import { useRoundStore } from '@/modules/game/state/round-store';
import { requestPointerLock } from '@/modules/game/utils/request-pointer-lock';
import { useMultiplayerStore } from '@/modules/multiplayer/stores/multiplayer-store';
import { clamp } from '@/utils/clamp';

interface UsePlayerPointerLockOptions {
  domElement: HTMLElement;
  eliminated: boolean;
  eliminatedRef: RefObject<boolean>;
  externalControlsRef: RefObject<unknown>;
}

function setGameCursorCaptured(captured: boolean): void {
  document.getElementById('game-canvas')?.classList.toggle('cursor-none', captured);
}

function releaseLook(domElement: HTMLElement): void {
  setLookEnabled(false);
  setGameCursorCaptured(false);
  if (document.pointerLockElement === domElement) {
    document.exitPointerLock();
  }
}

function engageLook(domElement: HTMLElement): void {
  setLookEnabled(true);
  setGameCursorCaptured(true);
  requestPointerLock(domElement);
}

/** Document mouse look on mount; Esc releases capture, canvas click re-engages. */
export function usePlayerPointerLock({
  domElement,
  eliminated,
  eliminatedRef,
  externalControlsRef,
}: UsePlayerPointerLockOptions): void {
  const connected = useMultiplayerStore((state) => state.connected);
  const mpPhase = useMultiplayerStore((state) => state.phase);
  const roundPhase = useRoundStore((state) => state.phase);
  const phase = connected ? mpPhase : roundPhase;
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  useEffect(() => {
    if (eliminated || phase === 'round-end') {
      releaseLook(domElement);
      return;
    }
    engageLook(domElement);
  }, [eliminated, phase, domElement]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code !== 'Escape' || event.repeat) {
        return;
      }
      if (eliminatedRef.current || externalControlsRef.current || !isLookEnabled()) {
        return;
      }
      releaseLook(domElement);
    };

    const onPointerLockChange = () => {
      if (document.pointerLockElement !== domElement && isLookEnabled()) {
        releaseLook(domElement);
      }
    };

    const onClick = () => {
      if (
        eliminatedRef.current
        || externalControlsRef.current
        || isLookEnabled()
        || phaseRef.current === 'round-end'
      ) {
        return;
      }
      engageLook(domElement);
    };

    const onMouseMove = (event: MouseEvent) => {
      if (!isLookEnabled() || eliminatedRef.current || externalControlsRef.current) {
        return;
      }

      const look = getPlayerTransform();
      look.yaw -= event.movementX * MOUSE_SENSITIVITY;

      const pitch = clamp(look.pitch - event.movementY * MOUSE_SENSITIVITY, -PITCH_LIMIT, PITCH_LIMIT);
      if (pitch >= LOOK_PITCH_FLOOR) {
        look.pitch = pitch;
      }
    };

    setLookEnabled(true);
    setGameCursorCaptured(true);

    domElement.addEventListener('click', onClick);
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerlockchange', onPointerLockChange);
    document.addEventListener('mousemove', onMouseMove);

    return () => {
      domElement.removeEventListener('click', onClick);
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerlockchange', onPointerLockChange);
      document.removeEventListener('mousemove', onMouseMove);
    };
  }, [domElement, eliminatedRef, externalControlsRef]);
}
