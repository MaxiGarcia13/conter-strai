import { describe, expect, it } from 'vitest';

import { WALL_HEIGHT, WALL_MATERIAL } from '@/modules/scenarios/pieces/constants';
import { buildHouses, WALL_HOLE_WIDTH } from '@/modules/scenarios/pieces/house-helpers';
import { findWallCorners, trimSegmentEnds } from '@/modules/scenarios/pieces/wall-corner-helpers';

const PLASTER = WALL_MATERIAL.plaster;
const THICKNESS = 1.2;

describe('findWallCorners', () => {
  it('places a post at each 90° union of a closed house', () => {
    const built = buildHouses([
      {
        id: 'closed',
        centerX: 0,
        centerZ: 0,
        width: 12,
        depth: 10,
        material: PLASTER,
      },
    ]);

    const corners = findWallCorners(built.walls, WALL_HEIGHT.full, PLASTER);
    expect(corners).toHaveLength(4);
    const points = corners.map((corner) => [corner.position[0], corner.position[2]]).sort();
    expect(points).toEqual([
      [-6, -5],
      [-6, 5],
      [6, -5],
      [6, 5],
    ].sort());
    expect(corners.every((corner) => corner.height === WALL_HEIGHT.full)).toBe(true);
  });

  it('keeps outer corners when a side is split by a doorway', () => {
    const built = buildHouses([
      {
        id: 'door',
        centerX: 0,
        centerZ: 0,
        width: 12,
        depth: 10,
        material: PLASTER,
        walls: { north: { hole: WALL_HOLE_WIDTH } },
      },
    ]);

    const corners = findWallCorners(built.walls, WALL_HEIGHT.full, PLASTER);
    expect(corners).toHaveLength(4);
    expect(corners.some((corner) => corner.position[0] === 0 && corner.position[2] === -5)).toBe(false);
  });

  it('omits corners on an open side', () => {
    const built = buildHouses([
      {
        id: 'open-n',
        centerX: 0,
        centerZ: 0,
        width: 12,
        depth: 10,
        material: PLASTER,
        walls: { north: 'open' },
      },
    ]);

    const corners = findWallCorners(built.walls, WALL_HEIGHT.full, PLASTER);
    expect(corners).toHaveLength(2);
    expect(corners.every((corner) => corner.position[2] === 5)).toBe(true);
  });

  it('uses the taller wall height when two sides meet', () => {
    const built = buildHouses([
      {
        id: 'stepped',
        centerX: 0,
        centerZ: 0,
        width: 12,
        depth: 10,
        material: PLASTER,
        height: 'full',
        walls: { north: { height: 'low' } },
      },
    ]);

    const corners = findWallCorners(built.walls, WALL_HEIGHT.full, PLASTER);
    const northCorners = corners.filter((corner) => corner.position[2] === -5);
    expect(northCorners).toHaveLength(2);
    expect(northCorners.every((corner) => corner.height === WALL_HEIGHT.full)).toBe(true);
  });
});

describe('trimSegmentEnds', () => {
  it('shortens a solid wall by half-thickness at each corner', () => {
    const built = buildHouses([
      {
        id: 'trim',
        centerX: 0,
        centerZ: 0,
        width: 12,
        depth: 10,
        material: PLASTER,
      },
    ]);
    const corners = findWallCorners(built.walls, WALL_HEIGHT.full, PLASTER);
    const north = built.walls.find((segment) => segment.id === 'trim-north');
    expect(north).toBeDefined();
    const trimmed = trimSegmentEnds(north!, corners, THICKNESS);
    expect(trimmed.start[0]).toBeCloseTo(-6 + THICKNESS / 2);
    expect(trimmed.end[0]).toBeCloseTo(6 - THICKNESS / 2);
    expect(trimmed.start[2]).toBe(-5);
    expect(trimmed.end[2]).toBe(-5);
  });

  it('only trims the outer end of a doorway span', () => {
    const built = buildHouses([
      {
        id: 'gap',
        centerX: 0,
        centerZ: 0,
        width: 12,
        depth: 10,
        material: PLASTER,
        walls: { north: { hole: WALL_HOLE_WIDTH } },
      },
    ]);
    const corners = findWallCorners(built.walls, WALL_HEIGHT.full, PLASTER);
    const westSpan = built.walls.find((segment) => segment.id === 'gap-north-a');
    expect(westSpan).toBeDefined();
    const originalLength = Math.abs(westSpan!.end[0] - westSpan!.start[0]);
    const trimmed = trimSegmentEnds(westSpan!, corners, THICKNESS);
    expect(Math.abs(trimmed.end[0] - trimmed.start[0])).toBeCloseTo(originalLength - THICKNESS / 2);
    expect(trimmed.end[0]).toBeCloseTo(westSpan!.end[0]);
  });
});
