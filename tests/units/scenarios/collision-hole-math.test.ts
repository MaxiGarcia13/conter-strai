import { describe, expect, it } from 'vitest';

import { buildCollisionSegments } from '@/modules/scenarios/pieces/collision-helpers';
import { WALL_MATERIAL } from '@/modules/scenarios/pieces/constants';
import { buildHouses, WALL_HOLE_WIDTH } from '@/modules/scenarios/pieces/house-helpers';

describe('collision hole math', () => {
  it('splits the north wall into two spans around a doorway hole and records the hole metadata', () => {
    const built = buildHouses([
      {
        id: 'house-doorway-test',
        centerX: 0,
        centerZ: 0,
        width: 12,
        depth: 10,
        material: WALL_MATERIAL.plaster,
        walls: { north: { hole: WALL_HOLE_WIDTH } },
      },
    ]);

    expect(built.holes).toEqual([{ axis: 'x', center: [0, 0, -5], width: WALL_HOLE_WIDTH }]);

    const northWallSegments = built.walls.filter((segment) => segment.start[2] === -5 && segment.end[2] === -5);
    expect(northWallSegments).toHaveLength(2);
    expect(northWallSegments.reduce((sum, segment) => sum + Math.abs(segment.end[0] - segment.start[0]), 0)).toBeCloseTo(
      12 - WALL_HOLE_WIDTH,
    );

    const collisionSegments = buildCollisionSegments(northWallSegments);
    expect(collisionSegments).toHaveLength(2);
    expect(collisionSegments.every(({ axis }) => axis === 'x')).toBe(true);
  });

  it('keeps the north wall solid when the proposed doorway is too wide to be valid', () => {
    const built = buildHouses([
      {
        id: 'house-oversized-hole-test',
        centerX: 0,
        centerZ: 0,
        width: 5,
        depth: 4,
        material: WALL_MATERIAL.plaster,
        walls: { north: { hole: 4.6 } },
      },
    ]);

    expect(built.holes).toEqual([]);

    const northWallSegments = built.walls.filter((segment) => segment.start[2] === -2 && segment.end[2] === -2);
    expect(northWallSegments).toHaveLength(1);
    expect(northWallSegments[0].start).toEqual([-2.5, 0, -2]);
    expect(northWallSegments[0].end).toEqual([2.5, 0, -2]);
  });
});
