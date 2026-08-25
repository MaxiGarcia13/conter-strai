import type { CollisionSegment } from '@/modules/scenarios/types';

export interface PlayerPosition {
  x: number;
  z: number;
}

/** Fixed XZ disc used for standing NPCs / dummies. */
export interface CircleBlocker {
  x: number;
  z: number;
  radius: number;
  /** When set, callers can drop eliminated entities from the blocker list. */
  entityId?: string;
}

const COLLISION_EPSILON = 1e-8;
const RESOLUTION_PASSES = 4;
const MAX_COLLISION_STEP = 0.2;

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.max(minimum, Math.min(value, maximum));
}

function resolveSegment(
  position: PlayerPosition,
  previousPosition: PlayerPosition,
  segment: CollisionSegment,
  radius: number,
): void {
  const minX = Math.min(segment.start[0], segment.end[0]);
  const maxX = Math.max(segment.start[0], segment.end[0]);
  const minZ = Math.min(segment.start[2], segment.end[2]);
  const maxZ = Math.max(segment.start[2], segment.end[2]);
  const closestX = clamp(position.x, minX, maxX);
  const closestZ = clamp(position.z, minZ, maxZ);
  let normalX = position.x - closestX;
  let normalZ = position.z - closestZ;
  const distanceSquared = normalX * normalX + normalZ * normalZ;

  if (distanceSquared >= radius * radius) {
    return;
  }

  if (distanceSquared > COLLISION_EPSILON) {
    const distance = Math.sqrt(distanceSquared);
    normalX /= distance;
    normalZ /= distance;
    const pushDistance = radius - distance;
    position.x += normalX * pushDistance;
    position.z += normalZ * pushDistance;
    return;
  }

  if (segment.axis === 'x') {
    normalZ = previousPosition.z < segment.start[2] ? -1 : 1;
    normalX = 0;
  } else {
    normalX = previousPosition.x < segment.start[0] ? -1 : 1;
    normalZ = 0;
  }

  position.x += normalX * radius;
  position.z += normalZ * radius;
}

function resolvePositionAgainstSegments(
  position: PlayerPosition,
  segments: CollisionSegment[],
  radius: number,
  previousPosition: PlayerPosition = position,
): PlayerPosition {
  const resolved = { ...position };
  for (let pass = 0; pass < RESOLUTION_PASSES; pass += 1) {
    const beforePass = { ...resolved };
    for (const segment of segments) {
      resolveSegment(resolved, previousPosition, segment, radius);
    }
    if (resolved.x === beforePass.x && resolved.z === beforePass.z) {
      break;
    }
  }
  return resolved;
}

/** Sweeps a player circle through solid wall spans; missing spans remain open. */
export function resolvePlayerCollision(
  position: PlayerPosition,
  segments: CollisionSegment[],
  radius: number,
  previousPosition: PlayerPosition = position,
): PlayerPosition {
  const deltaX = position.x - previousPosition.x;
  const deltaZ = position.z - previousPosition.z;
  const distance = Math.hypot(deltaX, deltaZ);
  const stepCount = Math.max(Math.ceil(distance / MAX_COLLISION_STEP), 1);
  const stepX = deltaX / stepCount;
  const stepZ = deltaZ / stepCount;
  let resolved = { ...previousPosition };

  for (let step = 0; step < stepCount; step += 1) {
    const intended = {
      x: resolved.x + stepX,
      z: resolved.z + stepZ,
    };
    resolved = resolvePositionAgainstSegments(intended, segments, radius, resolved);
  }

  return resolved;
}

/** Pushes the player circle out of overlapping solid discs (NPC bodies). */
export function resolveCircleBlockers(
  position: PlayerPosition,
  blockers: CircleBlocker[],
  playerRadius: number,
): PlayerPosition {
  const resolved = { ...position };

  for (let pass = 0; pass < RESOLUTION_PASSES; pass += 1) {
    let moved = false;
    for (const blocker of blockers) {
      const dx = resolved.x - blocker.x;
      const dz = resolved.z - blocker.z;
      const minDistance = playerRadius + blocker.radius;
      const distanceSquared = dx * dx + dz * dz;

      if (distanceSquared >= minDistance * minDistance) {
        continue;
      }

      if (distanceSquared > COLLISION_EPSILON) {
        const distance = Math.sqrt(distanceSquared);
        const push = (minDistance - distance) / distance;
        resolved.x += dx * push;
        resolved.z += dz * push;
      } else {
        // Exact center overlap — arbitrary axis so we still separate.
        resolved.x += minDistance;
      }
      moved = true;
    }
    if (!moved) {
      break;
    }
  }

  return resolved;
}
