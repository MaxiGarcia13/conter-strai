import type { RefObject } from 'react';
import type { Camera } from 'three';
import type { CircleBlocker } from '@/modules/game/utils/resolve-player-collision';
import type { ScenarioConfig } from '@/modules/scenarios';
import { useFrame } from '@react-three/fiber';

import { useRef } from 'react';
import { useHealthStore } from '@/modules/combat';
import {
  MAX_FRAME_DELTA_SECONDS,
  PLAYER_RADIUS,
  RUN_SPEED,
  WALK_SPEED,
} from '@/modules/game/constants/player';
import {
  getBodyAnchorY,
  getCameraMode,
  getPlayerPose,
  getPlayerTransform,
  setPlayerLocomotion,
  setPlayerPose,
} from '@/modules/game/state/player-state';
import { applyCameraMode } from '@/modules/game/utils/apply-camera-mode';
import { axesFromPressedCodes } from '@/modules/game/utils/axes-from-pressed-codes';
import { MOVE_CODES } from '@/modules/game/utils/move-codes';
import { resolveCircleBlockers, resolvePlayerCollision } from '@/modules/game/utils/resolve-player-collision';
import { resolveLocomotionState } from '@/modules/soldiers/utils/resolve-locomotion-state';
import { clamp } from '@/utils/clamp';

interface UsePlayerMovementFrameOptions {
  camera: Camera;
  bounds: ScenarioConfig['bounds'];
  collisionSegments: NonNullable<ScenarioConfig['collisionSegments']>;
  wallThickness: number;
  npcBlockers: CircleBlocker[];
  pressedCodesRef: RefObject<Set<string>>;
  eliminatedRef: RefObject<boolean>;
  externalControlsRef: RefObject<unknown>;
}

/** Per-frame move, collide, clamp, and apply the active camera mode. */
export function usePlayerMovementFrame({
  camera,
  bounds,
  collisionSegments,
  wallThickness,
  npcBlockers,
  pressedCodesRef,
  eliminatedRef,
  externalControlsRef,
}: UsePlayerMovementFrameOptions): void {
  const wasEliminatedRef = useRef(false);

  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, MAX_FRAME_DELTA_SECONDS);
    const pressed = pressedCodesRef.current;
    if (!pressed) {
      return;
    }

    if (eliminatedRef.current) {
      if (!wasEliminatedRef.current) {
        wasEliminatedRef.current = true;
        setPlayerPose('dying');
      }
      setPlayerLocomotion('idle');
      return;
    }

    wasEliminatedRef.current = false;

    // External controls (DEV free-cam) own the camera; freeze the soldier.
    if (externalControlsRef.current) {
      pressed.clear();
      setPlayerLocomotion('idle');
      return;
    }

    const { strafe, forward } = axesFromPressedCodes(pressed, MOVE_CODES);
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
}
