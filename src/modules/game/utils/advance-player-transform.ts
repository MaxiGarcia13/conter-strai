import type { CircleBlocker } from './resolve-player-collision';
import type { CollisionSegment } from '@/modules/scenarios/types';
import {
  RUN_BACKWARD_SPEED,
  RUN_SPEED,
  WALK_BACKWARD_SPEED,
  WALK_SPEED,
} from '@/modules/game/constants/locomotion';
import { PLAYER_RADIUS } from '@/modules/game/constants/player';
import { resolveLocomotionState } from '@/modules/soldiers/utils/resolve-locomotion-state';
import { clamp } from '@/utils/clamp';
import { resolveCircleBlockers, resolvePlayerCollision } from './resolve-player-collision';

export interface AdvanceInput {
  transform: { x: number; z: number; yaw: number };
  strafe: number;
  forward: number;
  running: boolean;
  delta: number;
  collisionSegments: CollisionSegment[];
  wallThickness: number;
  npcBlockers: CircleBlocker[];
  solidNpcFlags: boolean[];
  bounds: { width: number; depth: number };
}

export interface AdvanceResult {
  x: number;
  z: number;
  locomotion: 'idle' | 'walk' | 'run' | 'crouchWalking' | 'walkBackward' | 'runBackward';
}

/** Dominant backpedal: moving mostly away from facing. */
function isBackward(strafe: number, forward: number): boolean {
  return forward < 0 && Math.abs(forward) >= Math.abs(strafe);
}

/**
 * Pure movement advance: intended move → wall collision → NPC discs → bounds clamp.
 * No React, refs, or store access — fully testable.
 */
export function advancePlayerTransform({
  transform,
  strafe,
  forward,
  running,
  delta,
  collisionSegments,
  wallThickness,
  npcBlockers,
  solidNpcFlags,
  bounds,
}: AdvanceInput): AdvanceResult {
  const moving = strafe !== 0 || forward !== 0;
  const backward = isBackward(strafe, forward);
  const locomotion = resolveLocomotionState({ moving, running, backward });

  let x = transform.x;
  let z = transform.z;

  if (moving) {
    const inputLength = Math.hypot(strafe, forward);
    let speed = running ? RUN_SPEED : WALK_SPEED;
    if (backward) {
      speed = running ? RUN_BACKWARD_SPEED : WALK_BACKWARD_SPEED;
    }
    const sinYaw = Math.sin(transform.yaw);
    const cosYaw = Math.cos(transform.yaw);
    const intendedPosition = {
      x: x + ((-sinYaw * forward + cosYaw * strafe) / inputLength) * speed * delta,
      z: z + ((-cosYaw * forward - sinYaw * strafe) / inputLength) * speed * delta,
    };
    const resolvedPosition = resolvePlayerCollision(
      intendedPosition,
      collisionSegments,
      PLAYER_RADIUS + wallThickness / 2,
      { x, z },
    );
    x = resolvedPosition.x;
    z = resolvedPosition.z;
  }

  const solidNpcs = npcBlockers.filter((_, i) => solidNpcFlags[i]);
  const afterNpcs = resolveCircleBlockers({ x, z }, solidNpcs, PLAYER_RADIUS);
  x = afterNpcs.x;
  z = afterNpcs.z;

  const halfWidth = Math.max(bounds.width / 2 - PLAYER_RADIUS, 0);
  const halfDepth = Math.max(bounds.depth / 2 - PLAYER_RADIUS, 0);
  x = clamp(x, -halfWidth, halfWidth);
  z = clamp(z, -halfDepth, halfDepth);

  return { x, z, locomotion };
}
