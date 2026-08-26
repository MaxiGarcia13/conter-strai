import type { LocalSpawn } from '../utils/local-spawn';
import type { ScenarioConfig } from '@/modules/scenarios';
import { useFrame, useThree } from '@react-three/fiber';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useHealthStore } from '@/modules/combat';
import { LOCAL_PLAYER_ENTITY_ID } from '@/modules/game/constants/player';
import { resolveLocomotionState } from '@/modules/soldiers/utils/resolve-locomotion-state';
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
  getPlayerLocomotion,
  getPlayerPose,
  getPlayerTransform,
  resetPlayerTransform,
  setPlayerLocomotion,
  setPlayerPose,
} from '../state/player-state';
import { applyCameraMode } from '../utils/apply-camera-mode';
import { npcBlockersFromScenario } from '../utils/npc-blockers-from-scenario';
import { resolveCircleBlockers, resolvePlayerCollision } from '../utils/resolve-player-collision';

const MOVE_CODES = {
  forward: 'KeyW',
  back: 'KeyS',
  left: 'KeyA',
  right: 'KeyD',
  cameraCycle: 'KeyC',
  jump: 'KeyF',
  kneelToggle: 'KeyE',
  reload: 'KeyR',
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
  scenario: ScenarioConfig;
}

/**
 * Binds WASD + pointer-lock mouse look to the shared player transform and
 * positions the camera for the active mode each frame. Movement resolves
 * interior walls and NPC bodies before clamping against the scenario's outer bounds.
 */
export function usePlayerControls({
  bounds,
  collisionSegments,
  spawn,
  wallThickness,
  scenario,
}: UsePlayerControlsOptions) {
  const camera = useThree((state) => state.camera);
  const domElement = useThree((state) => state.gl.domElement);
  const [isPointerLocked, setIsPointerLocked] = useState(false);
  const eliminated = useHealthStore(
    (s) => s.healthById[LOCAL_PLAYER_ENTITY_ID]?.isEliminated ?? false,
  );
  const npcBlockers = useMemo(
    () => npcBlockersFromScenario(scenario, spawn.key),
    [scenario, spawn.key],
  );

  const pressedCodesRef = useRef(new Set<string>());
  const eliminatedRef = useRef(eliminated);
  eliminatedRef.current = eliminated;
  const wasEliminatedRef = useRef(false);

  useEffect(() => {
    camera.rotation.order = 'YXZ';
    // Idempotent so a dev remount cannot strand the player away from spawn.
    resetPlayerTransform(spawn.position[0], spawn.position[2], spawn.yaw);
  }, [camera, spawn]);

  useEffect(() => {
    const requestJump = () => {
      const pose = getPlayerPose();
      // If kneeling, clear kneel first; next frame will pick up the jump.
      if (pose === 'kneel') {
        setPlayerPose(null);
        return;
      }
      // Busy until the mixer finishes; LocalPlayer clears the pose on completion.
      if (pose === null) {
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

    const requestReload = () => {
      const pose = getPlayerPose();
      if (pose === null && getPlayerLocomotion() === 'idle') {
        setPlayerPose('reloading');
      } else if (pose === 'kneel') {
        setPlayerPose('reloadingKneel');
      }
    };

    const cancelReload = () => {
      const pose = getPlayerPose();
      if (pose === 'reloading') {
        setPlayerPose(null);
      } else if (pose === 'reloadingKneel') {
        setPlayerPose('kneel');
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      pressedCodesRef.current.add(event.code);

      if (event.repeat) {
        return;
      }

      if (eliminatedRef.current) {
        return;
      }

      if ((MOVE_KEY_CODES as readonly string[]).includes(event.code)) {
        cancelReload();
      }

      if (event.code === MOVE_CODES.cameraCycle) {
        cycleCameraMode();
      } else if (event.code === MOVE_CODES.jump) {
        requestJump();
      } else if (event.code === MOVE_CODES.kneelToggle) {
        toggleKneel();
      } else if (event.code === MOVE_CODES.reload) {
        requestReload();
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
    if (eliminated && document.pointerLockElement === domElement) {
      document.exitPointerLock();
    }
  }, [eliminated, domElement]);

  useEffect(() => {
    const requestLock = () => {
      if (eliminatedRef.current) {
        return;
      }
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
      if (document.pointerLockElement !== domElement || eliminatedRef.current) {
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

    if (eliminatedRef.current) {
      if (!wasEliminatedRef.current) {
        wasEliminatedRef.current = true;
        setPlayerPose('dying');
      }
      setPlayerLocomotion('idle');
      return;
    }

    wasEliminatedRef.current = false;

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
    // Walk-speed only while kneeling; run modifier ignored.
    const running = moving && pressed.has(MOVE_CODES.runModifier) && getPlayerPose() !== 'kneel';

    setPlayerLocomotion(resolveLocomotionState({ moving, running }));

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

    // Block walk-through of standing NPCs (skip corpses).
    const health = useHealthStore.getState();
    const solidNpcs = npcBlockers.filter(
      (blocker) => !blocker.entityId || !health.getHealth(blocker.entityId)?.isEliminated,
    );
    const afterNpcs = resolveCircleBlockers(
      { x: transform.x, z: transform.z },
      solidNpcs,
      PLAYER_RADIUS,
    );
    transform.x = afterNpcs.x;
    transform.z = afterNpcs.z;

    // Outer walls sit just outside bounds; keep the player body clear of them.
    const halfWidth = Math.max(bounds.width / 2 - PLAYER_RADIUS, 0);
    const halfDepth = Math.max(bounds.depth / 2 - PLAYER_RADIUS, 0);
    transform.x = clamp(transform.x, -halfWidth, halfWidth);
    transform.z = clamp(transform.z, -halfDepth, halfDepth);

    applyCameraMode(camera, getCameraMode(), transform, getBodyAnchorY());
  });

  return { isPointerLocked };
}
