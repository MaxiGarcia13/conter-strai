import type { RefObject } from 'react';
import { useEffect, useState } from 'react';
import { MOUSE_SENSITIVITY, PITCH_LIMIT } from '@/modules/game/constants/player';
import { getPlayerTransform } from '@/modules/game/state/player-state';
import { requestPointerLock } from '@/modules/game/utils/request-pointer-lock';
import { clamp } from '@/utils/clamp';

interface UsePlayerPointerLockOptions {
  domElement: HTMLElement;
  eliminated: boolean;
  eliminatedRef: RefObject<boolean>;
  externalControlsRef: RefObject<unknown>;
}

/** Click-to-lock, lock state, and mouse look into the shared player transform. */
export function usePlayerPointerLock({
  domElement,
  eliminated,
  eliminatedRef,
  externalControlsRef,
}: UsePlayerPointerLockOptions): { isPointerLocked: boolean } {
  const [isPointerLocked, setIsPointerLocked] = useState(false);

  useEffect(() => {
    if (eliminated && document.pointerLockElement === domElement) {
      document.exitPointerLock();
    }
  }, [eliminated, domElement]);

  useEffect(() => {
    const requestLock = () => {
      if (eliminatedRef.current || externalControlsRef.current) {
        return;
      }
      requestPointerLock(domElement);
    };

    const onPointerLockChange = () => {
      setIsPointerLocked(document.pointerLockElement === domElement);
    };

    const onMouseMove = (event: MouseEvent) => {
      if (
        document.pointerLockElement !== domElement
        || eliminatedRef.current
        || externalControlsRef.current
      ) {
        return;
      }

      const look = getPlayerTransform();
      look.yaw -= event.movementX * MOUSE_SENSITIVITY;

      const pitch = clamp(look.pitch - event.movementY * MOUSE_SENSITIVITY, -PITCH_LIMIT, PITCH_LIMIT);
      if (pitch >= -0.6) {
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
  }, [domElement, eliminatedRef, externalControlsRef]);

  return { isPointerLocked };
}
