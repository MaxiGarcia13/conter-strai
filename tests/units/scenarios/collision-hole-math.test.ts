import type { HouseSide } from '@/modules/scenarios/pieces/house-helpers';
import { describe, expect, it } from 'vitest';
import { buildCollisionSegments } from '@/modules/scenarios/pieces/collision-helpers';
import { FLOOR_MATERIAL, WALL_HEIGHT, WALL_MATERIAL } from '@/modules/scenarios/pieces/constants';
import { buildHouses, HOUSE_FLOOR_INSET, WALL_HOLE_WIDTH } from '@/modules/scenarios/pieces/house-helpers';
import { applyHousePreset, bombedHouse, cornerRuin, ruinedCottage } from '@/modules/scenarios/pieces/house-presets';

function wallSegmentsAtZ(built: ReturnType<typeof buildHouses>, z: number) {
  return built.walls.filter((segment) => segment.start[2] === z && segment.end[2] === z);
}

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

  it('windows produce left/right pillars, sill and lintel with a raised base and no hole metadata', () => {
    const built = buildHouses([
      {
        id: 'house-window-test',
        centerX: 0,
        centerZ: 0,
        width: 12,
        depth: 10,
        material: WALL_MATERIAL.plaster,
        walls: { north: { hole: { width: 1.2, height: 1.0, bottom: 1.2 } } },
      },
    ]);

    const northZ = -5;
    const segments = wallSegmentsAtZ(built, northZ);

    expect(segments).toHaveLength(4);
    expect(segments.map((segment) => segment.id)).toEqual([
      'house-window-test-north-a',
      'house-window-test-north-b-sill',
      'house-window-test-north-b-lintel',
      'house-window-test-north-c',
    ]);

    const [left, sill, lintel, right] = segments;

    const pillarWidth = (12 - 1.2) / 2;
    expect(Math.abs(left.end[0] - left.start[0])).toBeCloseTo(pillarWidth);
    expect(Math.abs(right.end[0] - right.start[0])).toBeCloseTo(pillarWidth);
    expect(left.height).toBe(WALL_HEIGHT.full);
    expect(right.height).toBe(WALL_HEIGHT.full);
    expect(left.baseY ?? 0).toBe(0);
    expect(right.baseY ?? 0).toBe(0);

    expect(Math.abs(sill.end[0] - sill.start[0])).toBeCloseTo(1.2);
    expect(sill.height).toBeCloseTo(1.2);
    expect(sill.baseY ?? 0).toBe(0);

    expect(Math.abs(lintel.end[0] - lintel.start[0])).toBeCloseTo(1.2);
    expect(lintel.height).toBeCloseTo(WALL_HEIGHT.full - 1.2 - 1.0);
    expect(lintel.baseY ?? 0).toBeCloseTo(1.2 + 1.0);

    expect(built.holes.filter((hole) => hole.axis === 'x' && hole.center[2] === northZ)).toHaveLength(0);
  });

  it('falls back to a solid wall when a window is too wide or too tall', () => {
    for (const hole of [
      { width: 12, height: 1.0, bottom: 1.2 },
      { width: 1.2, height: 1.0, bottom: 3.0 },
    ]) {
      const built = buildHouses([
        {
          id: `house-window-invalid-${hole.width}-${hole.bottom}`,
          centerX: 0,
          centerZ: 0,
          width: 12,
          depth: 10,
          material: WALL_MATERIAL.plaster,
          walls: { north: { hole } },
        },
      ]);

      const segments = wallSegmentsAtZ(built, -5);
      expect(segments).toHaveLength(1);
      expect(segments[0].start[0]).toBeCloseTo(-6);
      expect(segments[0].end[0]).toBeCloseTo(6);
      expect(built.holes.filter((hole) => hole.axis === 'x')).toHaveLength(0);
    }
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

describe('multiple wall openings', () => {
  it('emits solid spans, a door gap, and window sill/lintel for two openings on one side', () => {
    const built = buildHouses([
      {
        id: 'house-two-openings',
        centerX: 0,
        centerZ: 0,
        width: 12,
        depth: 10,
        material: WALL_MATERIAL.plaster,
        walls: {
          north: {
            holes: [
              { kind: 'door', width: 2.2, along: -2 },
              { kind: 'window', width: 1.2, height: 1.0, bottom: 1.2, along: 3 },
            ],
          },
        },
      },
    ]);

    const segments = wallSegmentsAtZ(built, -5);
    // solid left of door, solid between door+window, sill, lintel, solid right of window
    expect(segments).toHaveLength(5);

    const [left, mid, sill, lintel, right] = segments;

    // Door gap spans [-3.1, -0.9]; left solid ends at -3.1, mid solid starts at -0.9.
    expect(left.end[0]).toBeCloseTo(-3.1);
    expect(mid.start[0]).toBeCloseTo(-0.9);
    // Window spans [2.4, 3.6]; mid solid ends there and right solid starts after.
    expect(mid.end[0]).toBeCloseTo(2.4);
    expect(right.start[0]).toBeCloseTo(3.6);

    // Door is a passable gap: no full-height segment between left and mid spanning the gap.
    expect(segments.every((s) => Math.abs(s.end[0] - s.start[0]) > 1)).toBe(true);

    // Window sill/lintel sit at the window's along with the US-14 baseY.
    expect(sill.start[0]).toBeCloseTo(2.4);
    expect(sill.end[0]).toBeCloseTo(3.6);
    expect(sill.height).toBeCloseTo(1.2);
    expect(sill.baseY ?? 0).toBe(0);
    expect(lintel.baseY ?? 0).toBeCloseTo(1.2 + 1.0);

    // Only the door produces a CollisionHole, centered at its offset position.
    expect(built.holes).toHaveLength(1);
    expect(built.holes[0]).toEqual({ axis: 'x', center: [-2, 0, -5], width: 2.2 });
  });

  it('places opening centers at wallCenter + along on both X and Z walls', () => {
    const built = buildHouses([
      {
        id: 'house-along-axis',
        centerX: 10,
        centerZ: 20,
        width: 12,
        depth: 14,
        material: WALL_MATERIAL.plaster,
        walls: {
          north: { holes: [{ kind: 'door', width: 2.2, along: 3 }] },
          west: { holes: [{ kind: 'door', width: 2.2, along: -2 }] },
        },
      },
    ]);

    // North is an X-axis wall: center shifts along X.
    const northHole = built.holes.find((h) => h.axis === 'x' && h.center[2] === 20 - 7);
    expect(northHole).toEqual({ axis: 'x', center: [10 + 3, 0, 13], width: 2.2 });

    // West is a Z-axis wall: center shifts along Z.
    const westHole = built.holes.find((h) => h.axis === 'z' && h.center[0] === 10 - 6);
    expect(westHole).toEqual({ axis: 'z', center: [4, 0, 20 - 2], width: 2.2 });
  });

  it('falls back to a solid wall for overlap, too-close, past-end, and invalid window height', () => {
    const invalidSides: HouseSide[] = [
      // overlapping openings
      {
        holes: [
          { kind: 'door', width: 2.2, along: -1 },
          { kind: 'window', width: 2.0, height: 1.0, along: 0 },
        ],
      },
      // adjacent too close (edge-to-edge under 0.6 m)
      {
        holes: [
          { kind: 'door', width: 2.2, along: -2 },
          { kind: 'window', width: 1.0, height: 1.0, along: 0 },
        ],
      },
      // past the wall end
      { holes: [{ kind: 'door', width: 2.2, along: 4.7 }] },
      // window too tall for the side height
      { holes: [{ kind: 'window', width: 1.2, height: 1.0, bottom: 3.0, along: 0 }] },
    ];

    for (const walls of invalidSides) {
      const built = buildHouses([
        {
          id: 'house-invalid-openings',
          centerX: 0,
          centerZ: 0,
          width: 12,
          depth: 10,
          material: WALL_MATERIAL.plaster,
          walls: { north: walls },
        },
      ]);

      const segments = wallSegmentsAtZ(built, -5);
      expect(segments).toHaveLength(1);
      expect(segments[0].start[0]).toBeCloseTo(-6);
      expect(segments[0].end[0]).toBeCloseTo(6);
      expect(built.holes.filter((hole) => hole.axis === 'x' && hole.center[2] === -5)).toHaveLength(0);
    }
  });

  it('collisionHole emits per-door entries with offset centers and omits windows', () => {
    const built = buildHouses([
      {
        id: 'house-multi-door-holes',
        centerX: 0,
        centerZ: 0,
        width: 12,
        depth: 10,
        material: WALL_MATERIAL.plaster,
        walls: {
          north: {
            holes: [
              { kind: 'door', width: 1.5, along: -3 },
              { kind: 'window', width: 1.0, height: 1.0, along: 0 },
              { kind: 'door', width: 1.5, along: 3 },
            ],
          },
        },
      },
    ]);

    const holes = built.holes.filter((hole) => hole.axis === 'x' && hole.center[2] === -5);
    expect(holes).toHaveLength(2);
    expect(holes.map((hole) => hole.center[0])).toEqual([-3, 3]);
    expect(holes.map((hole) => hole.width)).toEqual([1.5, 1.5]);
  });
});
