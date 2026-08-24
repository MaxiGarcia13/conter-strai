import type { CollisionSegment } from '@/modules/scenarios/types';

export interface PlayerPosition {
  x: number;
  z: number;
}

const COLLISION_EPSILON = 1e-8;
const RESOLUTION_PASSES = 4;

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

/** Pushes a player circle out of solid wall spans; missing spans remain open. */
export function resolvePlayerCollision(
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
