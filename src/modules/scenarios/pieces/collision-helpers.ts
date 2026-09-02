import type { CollisionAxis, CollisionSegment, ScenarioWallSegment } from '../types';

function getAxis(start: ScenarioWallSegment['start'], end: ScenarioWallSegment['end']): CollisionAxis {
  const xAligned = start[2] === end[2] && start[0] !== end[0];
  const zAligned = start[0] === end[0] && start[2] !== end[2];
  if (xAligned) {
    return 'x';
  }
  if (zAligned) {
    return 'z';
  }
  throw new Error('Collision segments must be non-zero and axis-aligned');
}

/** Interior collider lines from authored wall spans; doorway gaps stay open. */
export function buildCollisionSegments(wallSegments: ScenarioWallSegment[]): CollisionSegment[] {
  return wallSegments.map(({ start, end, height, baseY }) => ({
    start,
    end,
    axis: getAxis(start, end),
    height,
    baseY,
  }));
}
