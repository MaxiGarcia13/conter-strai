import type { Camera } from 'three';
import { useEffect, useRef } from 'react';
import { EventDispatcher } from 'three';

import { clamp } from '@/utils/clamp';
import { MOUSE_SENSITIVITY, PITCH_LIMIT } from '../constants/player';
import { requestPointerLock } from '../utils/request-pointer-lock';

/** Marker so production player code can pause without importing this module. */
const DEV_CONTROLS = Object.assign(new EventDispatcher(), { enabled: true });

interface UseFreeCameraLookOptions {
  enabled: boolean;
  camera: Camera;
  domElement: HTMLElement;
  set: (state: { controls: EventDispatcher | null }) => void;
  get: () => { controls: EventDispatcher | null };
}

/** Claim/release R3F controls slot + pointer lock + mouse look. */
export function useFreeCameraLook({
  enabled,
  camera,
  domElement,
  set,
  get,
}: UseFreeCameraLookOptions): void {
  const yawPitchRef = useRef({ yaw: 0, pitch: 0 });

  // Claim / release the shared controls slot (production reads `state.controls`).
  useEffect(() => {
    if (!enabled) {
      return;
    }
    set({ controls: DEV_CONTROLS });
    return () => {
      if (get().controls === DEV_CONTROLS) {
        set({ controls: null });
      }
    };
  }, [enabled, set, get]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    camera.rotation.order = 'YXZ';
    yawPitchRef.current = {
      yaw: camera.rotation.y,
      pitch: camera.rotation.x,
    };

    if (document.pointerLockElement) {
      document.exitPointerLock();
    }

    const requestLock = () => {
      requestPointerLock(domElement);
    };

    const onMouseMove = (event: MouseEvent) => {
      if (document.pointerLockElement !== domElement) {
        return;
      }
      const look = yawPitchRef.current;
      look.yaw -= event.movementX * MOUSE_SENSITIVITY;
      look.pitch = clamp(
        look.pitch - event.movementY * MOUSE_SENSITIVITY,
        -PITCH_LIMIT,
        PITCH_LIMIT,
      );
      camera.rotation.y = look.yaw;
      camera.rotation.x = look.pitch;
    };

    // Capture so player-controls click-to-lock does not win the same click.
    domElement.addEventListener('click', requestLock, true);
    document.addEventListener('mousemove', onMouseMove);

    return () => {
      domElement.removeEventListener('click', requestLock, true);
      document.removeEventListener('mousemove', onMouseMove);
      if (document.pointerLockElement === domElement) {
        document.exitPointerLock();
      }
    };
  }, [enabled, camera, domElement]);
}
