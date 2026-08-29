import { describe, expect, it } from 'vitest';

import { arena01 } from '@/modules/scenarios/maps/arena-01';
import { floorZone } from '@/modules/scenarios/pieces/floor-helpers';
import {
  assertNoFloorOverlaps,
  findFloorOverlaps,
  floorZoneBounds,
  zonesOverlap,
} from '@/modules/scenarios/pieces/floor-zone-helpers';

const asphalt = 'asphalt' as const;

describe('floorZoneBounds', () => {
  it('computes XZ bounds from the zone center and size', () => {
    const zone = floorZone('test', asphalt, 10, -4, 6, 8);
    expect(floorZoneBounds(zone)).toEqual({ minX: 7, maxX: 13, minZ: -8, maxZ: 0 });
  });
});

describe('zonesOverlap', () => {
  it('is true for overlapping rects', () => {
    const a = floorZone('a', asphalt, 0, 0, 10, 10);
    const b = floorZone('b', asphalt, 5, 0, 10, 10);
    expect(zonesOverlap(a, b)).toBe(true);
  });

  it('is false when rects only share an edge', () => {
    const a = floorZone('a', asphalt, 0, 0, 10, 10);
    const b = floorZone('b', asphalt, 10, 0, 10, 10);
    expect(zonesOverlap(a, b)).toBe(false);
  });

  it('is false for disjoint rects', () => {
    const a = floorZone('a', asphalt, 0, 0, 4, 4);
    const b = floorZone('b', asphalt, 8, 8, 4, 4);
    expect(zonesOverlap(a, b)).toBe(false);
  });
});

describe('findFloorOverlaps / assertNoFloorOverlaps', () => {
  it('throws with the offending zone ids when overlaps exist', () => {
    const overlapping = [
      floorZone('a', asphalt, 0, 0, 10, 10),
      floorZone('b', asphalt, 5, 5, 10, 10),
    ];
    expect(findFloorOverlaps(overlapping).map(({ a, b }) => [a.id, b.id])).toEqual([['a', 'b']]);
    expect(() => assertNoFloorOverlaps(overlapping)).toThrow(/a vs b/);
  });

  it('passes for a set that shares edges only', () => {
    const flush = [
      floorZone('a', asphalt, 0, 0, 10, 10),
      floorZone('b', asphalt, 10, 0, 10, 10),
      floorZone('c', asphalt, 0, 10, 10, 10),
    ];
    expect(() => assertNoFloorOverlaps(flush)).not.toThrow();
  });

  it('has zero overlaps for the composed arena-01 floors', () => {
    const floors = arena01.floorZones ?? [];
    expect(findFloorOverlaps(floors)).toEqual([]);
    expect(() => assertNoFloorOverlaps(floors)).not.toThrow();
  });
});
