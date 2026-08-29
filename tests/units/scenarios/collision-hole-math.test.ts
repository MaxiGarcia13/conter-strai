import { describe, expect, it } from 'vitest';

import { buildCollisionSegments } from '@/modules/scenarios/pieces/collision-helpers';
import { FLOOR_MATERIAL, WALL_HEIGHT, WALL_MATERIAL } from '@/modules/scenarios/pieces/constants';
import { buildHouses, HOUSE_FLOOR_INSET, WALL_HOLE_WIDTH } from '@/modules/scenarios/pieces/house-helpers';
import { applyHousePreset, bombedHouse, cornerRuin, ruinedCottage } from '@/modules/scenarios/pieces/house-presets';

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

  it('skips rendering and collision for an open side', () => {
    const built = buildHouses([
      {
        id: 'house-open-test',
        centerX: 0,
        centerZ: 0,
        width: 12,
        depth: 10,
        material: WALL_MATERIAL.plaster,
        walls: { north: 'open' },
      },
    ]);

    const northWallSegments = built.walls.filter((segment) => segment.start[2] === -5 && segment.end[2] === -5);
    expect(northWallSegments).toHaveLength(0);
    expect(built.holes.filter((hole) => hole.axis === 'x' && hole.center[2] === -5)).toHaveLength(0);
  });

  it('applies the house-level wall height to all sides', () => {
    const built = buildHouses([
      {
        id: 'house-height-test',
        centerX: 0,
        centerZ: 0,
        width: 12,
        depth: 10,
        material: WALL_MATERIAL.plaster,
        height: 'mid',
      },
    ]);

    expect(built.walls).toHaveLength(4);
    expect(built.walls.every((segment) => segment.height === WALL_HEIGHT.mid)).toBe(true);
  });

  it('lets a per-side height override the house-level height', () => {
    const built = buildHouses([
      {
        id: 'house-per-side-height-test',
        centerX: 0,
        centerZ: 0,
        width: 12,
        depth: 10,
        material: WALL_MATERIAL.plaster,
        height: 'full',
        walls: { north: { height: 'low' } },
      },
    ]);

    const northWallSegments = built.walls.filter((segment) => segment.start[2] === -5 && segment.end[2] === -5);
    expect(northWallSegments).toHaveLength(1);
    expect(northWallSegments[0].height).toBe(WALL_HEIGHT.low);

    const rest = built.walls.filter((segment) => segment.start[2] !== -5);
    expect(rest.every((segment) => segment.height === WALL_HEIGHT.full)).toBe(true);
  });

  it('insets the interior floor from the walls by default and via override', () => {
    const built = buildHouses([
      {
        id: 'house-inset-default',
        centerX: 0,
        centerZ: 0,
        width: 12,
        depth: 10,
        material: WALL_MATERIAL.plaster,
      },
      {
        id: 'house-inset-override',
        centerX: 20,
        centerZ: 0,
        width: 12,
        depth: 10,
        material: WALL_MATERIAL.plaster,
        floorInset: 1,
      },
    ]);

    const defaultFloor = built.floors.find((floor) => floor.id === 'house-inset-default-floor');
    const overrideFloor = built.floors.find((floor) => floor.id === 'house-inset-override-floor');

    expect(defaultFloor?.size).toEqual([12 - HOUSE_FLOOR_INSET * 2, 10 - HOUSE_FLOOR_INSET * 2]);
    expect(overrideFloor?.size).toEqual([10, 8]);
  });

  it('supports a floor material override', () => {
    const built = buildHouses([
      {
        id: 'house-floor-override',
        centerX: 0,
        centerZ: 0,
        width: 12,
        depth: 10,
        material: WALL_MATERIAL.fort,
        floorAssetId: FLOOR_MATERIAL.tile,
      },
    ]);

    expect(built.floors[0].assetId).toBe(FLOOR_MATERIAL.tile);
  });

  it('applies named presets via applyHousePreset with variadic height and open sides', () => {
    const cottage = applyHousePreset(ruinedCottage, { id: 'h-cottage', centerX: -4, centerZ: 0 });
    const ruin = applyHousePreset(cornerRuin, { id: 'h-ruin', centerX: 4, centerZ: 0 });
    const bombed = applyHousePreset(bombedHouse, { id: 'h-bombed', centerX: 12, centerZ: 0 });

    const built = buildHouses([cottage, ruin, bombed]);

    expect(built.floors.map((floor) => floor.id)).toEqual(
      expect.arrayContaining(['h-cottage-floor', 'h-ruin-floor', 'h-bombed-floor']),
    );

    const cottageNorth = built.walls.filter((s) => s.id?.startsWith('h-cottage-north'));
    expect(cottageNorth[0].height).toBe(WALL_HEIGHT.low);

    const ruinWest = built.walls.filter((s) => s.id?.startsWith('h-ruin-west'));
    expect(ruinWest).toHaveLength(0);

    const bombedNorth = built.walls.filter((s) => s.id?.startsWith('h-bombed-north'));
    expect(bombedNorth).toHaveLength(0);
  });
});
