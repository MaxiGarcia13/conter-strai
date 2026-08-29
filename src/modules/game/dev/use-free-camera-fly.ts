import type { Camera } from 'three';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { MOVE_CODES } from '../constants/game-bindings';
import { RUN_SPEED } from '../constants/locomotion';
import { MAX_FRAME_DELTA_SECONDS } from '../constants/player';
import { usePressedKeyCodes } from '../hooks/use-pressed-key-codes';
import { axesFromPressedCodes } from '../utils/axes-from-pressed-codes';

const FREE_CAM_KEYS = {
  up: 'KeyE',
  down: 'KeyQ',
  boost: 'ShiftLeft',
  boostAlt: 'ShiftRight',
} as const;

const FLY_SPEED = RUN_SPEED * 1.4;
const FLY_BOOST = RUN_SPEED * 2.8;

const _forward = new THREE.Vector3();
const _right = new THREE.Vector3();
const _worldUp = new THREE.Vector3(0, 1, 0);

interface UseFreeCameraFlyOptions {
  enabled: boolean;
  camera: Camera;
}

/** useFrame fly: WASD via shared axes + Q/E vertical + boost. */
export function useFreeCameraFly({ enabled, camera }: UseFreeCameraFlyOptions): void {
  const pressedRef = usePressedKeyCodes({ enabled });

  useFrame((_, rawDelta) => {
    if (!enabled) {
      return;
    }

    const pressed = pressedRef.current;
    if (!pressed) {
      return;
    }

    const delta = Math.min(rawDelta, MAX_FRAME_DELTA_SECONDS);
    const { strafe, forward } = axesFromPressedCodes(pressed, MOVE_CODES);
    let vertical = 0;

    if (pressed.has(FREE_CAM_KEYS.up)) {
      vertical += 1;
    }
    if (pressed.has(FREE_CAM_KEYS.down)) {
      vertical -= 1;
    }

    if (strafe === 0 && forward === 0 && vertical === 0) {
      return;
    }

    const boost = pressed.has(FREE_CAM_KEYS.boost) || pressed.has(FREE_CAM_KEYS.boostAlt);
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
}
