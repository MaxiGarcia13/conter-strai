import type { ScenarioConfig } from '@/modules/scenarios';
import { useFrame, useThree } from '@react-three/fiber';

import { useEffect, useRef, useState } from 'react';

import {
  MAX_FRAME_DELTA_SECONDS,
  MOUSE_SENSITIVITY,
  PITCH_LIMIT,
  PLAYER_EYE_HEIGHT,
  PLAYER_RADIUS,
  WALK_SPEED,
} from '../constants/player';

const MOVE_CODES = {
  forward: 'KeyW',
  back: 'KeyS',
  left: 'KeyA',
  right: 'KeyD',
} as const;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

interface UseFpsControlsOptions {
  bounds: ScenarioConfig['bounds'];
}

/**
 * Binds WASD + pointer-lock mouse look to the R3F camera and clamps
 * movement against the scenario's outer bounds each frame.
 */
export function useFpsControls({ bounds }: UseFpsControlsOptions) {
  const camera = useThree((state) => state.camera);
  const domElement = useThree((state) => state.gl.domElement);
  const [isPointerLocked, setIsPointerLocked] = useState(false);

  const pressedCodesRef = useRef(new Set<string>());
  // Hot-path look state stays in a ref; React state would re-render per mouse move.
  const yawPitchRef = useRef({ yaw: 0, pitch: 0 });

  useEffect(() => {
    camera.rotation.order = 'YXZ';
  }, [camera]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      pressedCodesRef.current.add(event.code);
    };
    const onKeyUp = (event: KeyboardEvent) => {
      pressedCodesRef.current.delete(event.code);
    };
    const onBlur = () => {
      pressedCodesRef.current.clear();
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
      pressedCodesRef.current.clear();
    };
  }, []);

  useEffect(() => {
    const requestLock = () => {
      try {
        // Rapid re-lock after Esc is rejected by browsers; swallow it.
        const request = domElement.requestPointerLock() as unknown;
        if (request instanceof Promise) {
          request.catch(() => undefined);
        }
      } catch {
        // Pointer lock unavailable (iframe permissions, etc.).
      }
    };
    const onPointerLockChange = () => {
      setIsPointerLocked(document.pointerLockElement === domElement);
    };
    const onMouseMove = (event: MouseEvent) => {
      if (document.pointerLockElement !== domElement) {
        return;
      }
      const look = yawPitchRef.current;
      look.yaw -= event.movementX * MOUSE_SENSITIVITY;
      look.pitch = clamp(look.pitch - event.movementY * MOUSE_SENSITIVITY, -PITCH_LIMIT, PITCH_LIMIT);
    };

    domElement.addEventListener('click', requestLock);
    document.addEventListener('pointerlockchange', onPointerLockChange);
    document.addEventListener('mousemove', onMouseMove);
    return () => {
      domElement.removeEventListener('click', requestLock);
      document.removeEventListener('pointerlockchange', onPointerLockChange);
      document.removeEventListener('mousemove', onMouseMove);
    };
  }, [domElement]);

  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, MAX_FRAME_DELTA_SECONDS);
    const pressed = pressedCodesRef.current;
    let strafe = 0;
    let forward = 0;
    if (pressed.has(MOVE_CODES.forward)) {
      forward += 1;
    }
    if (pressed.has(MOVE_CODES.back)) {
      forward -= 1;
    }
    if (pressed.has(MOVE_CODES.left)) {
      strafe -= 1;
    }
    if (pressed.has(MOVE_CODES.right)) {
      strafe += 1;
    }

    const { yaw, pitch } = yawPitchRef.current;
    camera.rotation.set(pitch, yaw, 0);

    if (strafe !== 0 || forward !== 0) {
      // Ground-plane basis for the current yaw (yaw 0 faces −Z); normalized so diagonals aren't faster.
      const inputLength = Math.hypot(strafe, forward);
      const sinYaw = Math.sin(yaw);
      const cosYaw = Math.cos(yaw);
      camera.position.x += ((-sinYaw * forward + cosYaw * strafe) / inputLength) * WALK_SPEED * delta;
      camera.position.z += ((-cosYaw * forward - sinYaw * strafe) / inputLength) * WALK_SPEED * delta;
    }

    // Outer walls sit just outside bounds; keep the player body clear of them.
    const halfWidth = Math.max(bounds.width / 2 - PLAYER_RADIUS, 0);
    const halfDepth = Math.max(bounds.depth / 2 - PLAYER_RADIUS, 0);
    camera.position.x = clamp(camera.position.x, -halfWidth, halfWidth);
    camera.position.z = clamp(camera.position.z, -halfDepth, halfDepth);
    camera.position.y = PLAYER_EYE_HEIGHT;
  });

  return { isPointerLocked };
}
