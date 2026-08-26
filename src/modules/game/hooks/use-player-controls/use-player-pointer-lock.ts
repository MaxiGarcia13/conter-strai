import type { RefObject } from 'react';
import { useEffect } from 'react';
import { LOOK_PITCH_FLOOR, MOUSE_SENSITIVITY, PITCH_LIMIT } from '@/modules/game/constants/player';
import { getPlayerTransform } from '@/modules/game/state/player-state';
import { requestPointerLock } from '@/modules/game/utils/request-pointer-lock';
import { clamp } from '@/utils/clamp';

interface UsePlayerPointerLockOptions {
  domElement: HTMLElement;
  eliminated: boolean;
  eliminatedRef: RefObject<boolean>;
  externalControlsRef: RefObject<unknown>;
}

/** Click-to-lock and mouse look into the shared player transform. */
export function usePlayerPointerLock({
  domElement,
  eliminated,
  eliminatedRef,
  externalControlsRef,
}: UsePlayerPointerLockOptions): void {
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
      if (pitch >= LOOK_PITCH_FLOOR) {
        look.pitch = pitch;
      }
    };

    domElement.addEventListener('click', requestLock);
    document.addEventListener('mousemove', onMouseMove);

    return () => {
      domElement.removeEventListener('click', requestLock);
      document.removeEventListener('mousemove', onMouseMove);
    };
  }, [domElement, eliminatedRef, externalControlsRef]);
}
