import type { CollisionSegment, ScenarioWallSegment } from '../types';

/** Interior collider lines from authored wall spans; doorway gaps stay open. */
export function buildCollisionSegments(wallSegments: ScenarioWallSegment[]): CollisionSegment[] {
  return wallSegments.map(({ start, end, height }) => ({ start, end, height }));
}
