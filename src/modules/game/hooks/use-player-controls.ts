import type { LocalSpawn } from '../utils/local-spawn';
import type { ScenarioConfig } from '@/modules/scenarios';

import { useFrame, useThree } from '@react-three/fiber';

import { useEffect, useRef, useState } from 'react';
import { clamp } from '@/utils/clamp';
import {
  MAX_FRAME_DELTA_SECONDS,
  MOUSE_SENSITIVITY,
  PITCH_LIMIT,
  PLAYER_RADIUS,
  RUN_SPEED,
  WALK_SPEED,
} from '../constants/player';
import {
  cycleCameraMode,
  getBodyAnchorY,
  getCameraMode,
  getPlayerPose,
  getPlayerTransform,
  resetPlayerTransform,
  setPlayerLocomotion,
  setPlayerPose,
} from '../state/player-state';
import { applyCameraMode } from '../utils/apply-camera-mode';
import { resolvePlayerCollision } from '../utils/resolve-player-collision';

const MOVE_CODES = {
  forward: 'KeyW',
  back: 'KeyS',
  left: 'KeyA',
  right: 'KeyD',
  cameraCycle: 'KeyC',
  jump: 'KeyF',
  kneelToggle: 'KeyE',
  runModifier: 'Space',
} as const;

const MOVE_KEY_CODES = [MOVE_CODES.forward, MOVE_CODES.back, MOVE_CODES.left, MOVE_CODES.right] as const;

function isMovePressed(pressed: Set<string>): boolean {
  return MOVE_KEY_CODES.some((code) => pressed.has(code));
}

interface UsePlayerControlsOptions {
  bounds: ScenarioConfig['bounds'];
  collisionSegments: NonNullable<ScenarioConfig['collisionSegments']>;
  wallThickness: number;
  spawn: LocalSpawn;
}

/**
 * Binds WASD + pointer-lock mouse look to the shared player transform and
 * positions the camera for the active mode each frame. Movement resolves
 * interior walls before clamping against the scenario's outer bounds.
 */
export function usePlayerControls({ bounds, collisionSegments, spawn, wallThickness }: UsePlayerControlsOptions) {
  const camera = useThree((state) => state.camera);
  const domElement = useThree((state) => state.gl.domElement);
  const [isPointerLocked, setIsPointerLocked] = useState(false);

  const pressedCodesRef = useRef(new Set<string>());

  useEffect(() => {
    camera.rotation.order = 'YXZ';
    // Idempotent so a dev remount cannot strand the player away from spawn.
    resetPlayerTransform(spawn.position[0], spawn.position[2], spawn.yaw);
  }, [camera, spawn]);

  useEffect(() => {
    const requestJump = () => {
      // Busy until the mixer finishes; LocalPlayer clears the pose on completion.
      if (getPlayerPose() === null) {
        setPlayerPose('jump');
      }
    };

    const toggleKneel = () => {
      const pose = getPlayerPose();
      if (pose === 'kneel') {
        setPlayerPose(null);
        return;
      }
      if (pose === null && !isMovePressed(pressedCodesRef.current)) {
        setPlayerPose('kneel');
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      pressedCodesRef.current.add(event.code);

      if (event.repeat) {
        return;
      }

      if (event.code === MOVE_CODES.cameraCycle) {
        cycleCameraMode();
      } else if (event.code === MOVE_CODES.jump) {
        requestJump();
      } else if (event.code === MOVE_CODES.kneelToggle) {
        toggleKneel();
      }
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

      const look = getPlayerTransform();
      look.yaw -= event.movementX * MOUSE_SENSITIVITY;

      const pitch = clamp(look.pitch - event.movementY * MOUSE_SENSITIVITY, -PITCH_LIMIT, PITCH_LIMIT);
      if (pitch >= -0.6)
        look.pitch = pitch;
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

    const transform = getPlayerTransform();
    const moving = strafe !== 0 || forward !== 0;
    const running = moving && pressed.has(MOVE_CODES.runModifier);

    // Kneeling is a stationary pose; movement cancels it before locomotion is written.
    if (moving && getPlayerPose() === 'kneel') {
      setPlayerPose(null);
    }

    setPlayerLocomotion(running ? 'run' : moving ? 'walk' : 'idle');

    if (moving) {
      const previousPosition = { x: transform.x, z: transform.z };
      // Ground-plane basis for the current yaw (yaw 0 faces −Z); normalized so diagonals aren't faster.
      const inputLength = Math.hypot(strafe, forward);
      const speed = running ? RUN_SPEED : WALK_SPEED;
      const sinYaw = Math.sin(transform.yaw);
      const cosYaw = Math.cos(transform.yaw);
      const intendedPosition = {
        x: transform.x + ((-sinYaw * forward + cosYaw * strafe) / inputLength) * speed * delta,
        z: transform.z + ((-cosYaw * forward - sinYaw * strafe) / inputLength) * speed * delta,
      };
      const resolvedPosition = resolvePlayerCollision(
        intendedPosition,
        collisionSegments,
        PLAYER_RADIUS + wallThickness / 2,
        previousPosition,
      );
      transform.x = resolvedPosition.x;
      transform.z = resolvedPosition.z;
    }

    // Outer walls sit just outside bounds; keep the player body clear of them.
    const halfWidth = Math.max(bounds.width / 2 - PLAYER_RADIUS, 0);
    const halfDepth = Math.max(bounds.depth / 2 - PLAYER_RADIUS, 0);
    transform.x = clamp(transform.x, -halfWidth, halfWidth);
    transform.z = clamp(transform.z, -halfDepth, halfDepth);

    applyCameraMode(camera, getCameraMode(), transform, getBodyAnchorY());
  });

  return { isPointerLocked };
}
