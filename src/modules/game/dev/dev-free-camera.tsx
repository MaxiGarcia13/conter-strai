import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

import { clamp } from '@/utils/clamp';
import {
  MAX_FRAME_DELTA_SECONDS,
  MOUSE_SENSITIVITY,
  PITCH_LIMIT,
  RUN_SPEED,
} from '../constants/player';
import { toggleFreeCamera } from './free-camera-state';
import { useFreeCamera } from './use-free-camera';

const MOVE = {
  forward: 'KeyW',
  back: 'KeyS',
  left: 'KeyA',
  right: 'KeyD',
  up: 'KeyE',
  down: 'KeyQ',
  boost: 'ShiftLeft',
  boostAlt: 'ShiftRight',
  toggle: 'KeyV',
} as const;

const FLY_SPEED = RUN_SPEED * 1.4;
const FLY_BOOST = RUN_SPEED * 2.8;

/** Marker so production player code can pause without importing this module. */
const DEV_CONTROLS = Object.assign(new THREE.EventDispatcher(), { enabled: true });

const _forward = new THREE.Vector3();
const _right = new THREE.Vector3();
const _worldUp = new THREE.Vector3(0, 1, 0);

/**
 * Ghost free-cam: WASD fly, click canvas then move mouse to look, Q/E vertical.
 * Registers R3F `controls` so player look/move yield without a free-cam import.
 */
export function DevFreeCamera() {
  const enabled = useFreeCamera();
  const camera = useThree((state) => state.camera);
  const domElement = useThree((state) => state.gl.domElement);
  const set = useThree((state) => state.set);
  const get = useThree((state) => state.get);
  const pressedRef = useRef(new Set<string>());
  const yawPitchRef = useRef({ yaw: 0, pitch: 0 });

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.repeat || event.code !== MOVE.toggle) {
        return;
      }
      toggleFreeCamera();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

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
      pressedRef.current.clear();
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

    const pressed = pressedRef.current;

    const onKeyDown = (event: KeyboardEvent) => {
      pressed.add(event.code);
    };
    const onKeyUp = (event: KeyboardEvent) => {
      pressed.delete(event.code);
    };
    const onBlur = () => {
      pressed.clear();
    };

    const requestLock = () => {
      try {
        const request = domElement.requestPointerLock() as unknown;
        if (request instanceof Promise) {
          request.catch(() => undefined);
        }
      } catch {
        // Pointer lock unavailable.
      }
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

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);
    // Capture so player-controls click-to-lock does not win the same click.
    domElement.addEventListener('click', requestLock, true);
    document.addEventListener('mousemove', onMouseMove);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
      domElement.removeEventListener('click', requestLock, true);
      document.removeEventListener('mousemove', onMouseMove);
      pressed.clear();
      if (document.pointerLockElement === domElement) {
        document.exitPointerLock();
      }
    };
  }, [enabled, camera, domElement]);

  useFrame((_, rawDelta) => {
    if (!enabled) {
      return;
    }

    const delta = Math.min(rawDelta, MAX_FRAME_DELTA_SECONDS);
    const pressed = pressedRef.current;
    let strafe = 0;
    let forward = 0;
    let vertical = 0;

    if (pressed.has(MOVE.forward)) {
      forward += 1;
    }
    if (pressed.has(MOVE.back)) {
      forward -= 1;
    }
    if (pressed.has(MOVE.left)) {
      strafe -= 1;
    }
    if (pressed.has(MOVE.right)) {
      strafe += 1;
    }
    if (pressed.has(MOVE.up)) {
      vertical += 1;
    }
    if (pressed.has(MOVE.down)) {
      vertical -= 1;
    }

    if (strafe === 0 && forward === 0 && vertical === 0) {
      return;
    }

    const boost = pressed.has(MOVE.boost) || pressed.has(MOVE.boostAlt);
    const speed = (boost ? FLY_BOOST : FLY_SPEED) * delta;
    const inputLength = Math.hypot(strafe, forward, vertical) || 1;

    camera.getWorldDirection(_forward);
    _right.crossVectors(_forward, _worldUp).normalize();
    _forward.y = 0;
    _forward.normalize();

    camera.position.addScaledVector(_forward, (forward / inputLength) * speed);
    camera.position.addScaledVector(_right, (strafe / inputLength) * speed);
    camera.position.y += (vertical / inputLength) * speed;
  });

  return null;
}
