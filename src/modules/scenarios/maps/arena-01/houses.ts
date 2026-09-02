import type { HouseFootprint } from '@/modules/scenarios/pieces/house-helpers';
import type { CollisionHole, CollisionSegment, ScenarioFloorZone, ScenarioWallSegment } from '@/modules/scenarios/types';
import { buildCollisionSegments } from '@/modules/scenarios/pieces/collision-helpers';
import { WALL_MATERIAL } from '@/modules/scenarios/pieces/constants';
import { buildHouses, WALL_HOLE_WIDTH } from '@/modules/scenarios/pieces/house-helpers';

const PLASTER = WALL_MATERIAL.plaster;
const FORT = WALL_MATERIAL.fort;
const HOLE = WALL_HOLE_WIDTH;

/** House footprints matching the diagram (white rectangles). */
const arena01Houses: HouseFootprint[] = [
  // Top row — small south hole toward main street
  {
    id: 'house-tl',
    centerX: -42,
    centerZ: -18,
    width: 14,
    depth: 8,
    material: PLASTER,
    walls: {
      south: {
        holes: [
          {
            kind: 'door',
            width: HOLE,
            along: -3.5,
          },
          {
            kind: 'window',
            width: 4,
            height: 1.4,
            along: 3,
          },
        ],
      },
    },
  },
  {
    id: 'house-tlc',
    centerX: -26,
    centerZ: -18,
    width: 14,
    depth: 8,
    material: PLASTER,
    walls: {
      south: {
        holes: [
          {
            kind: 'door',
            width: HOLE,
            along: 2,
          },
          {
            kind: 'window',
            width: 3,
            height: 1.4,
            along: -3.5,
          },
        ],
      },
    },
  },
  {
    id: 'house-trc',
    centerX: -8,
    centerZ: -18,
    width: 16,
    depth: 8,
    material: PLASTER,
    walls: {
      south: {
        holes: [
          {
            kind: 'door',
            width: HOLE,
            along: 2,
          },
          {
            kind: 'window',
            width: 1,
            height: 1.4,
            along: -3.5,
          },
          {
            kind: 'window',
            width: 1,
            height: 1.4,
            along: 5,
          },
        ],
      },
      north: { hole: { width: 1.5, height: 1.0 } },
      east: {
        holes: [
          {
            kind: 'window',
            width: 1,
            height: 1.4,
            along: 1,
          },
        ],
      },
    },
  },
  {
    id: 'house-tr',
    centerX: 14,
    centerZ: -18,
    width: 14,
    depth: 8,
    material: PLASTER,
    walls: {
      south: {
        holes: [
          {
            kind: 'door',
            width: HOLE,
            along: 2.5,
          },
          {
            kind: 'window',
            width: 1,
            height: 1.4,
            along: -4.5,
          },
        ],
      },
      west: {
        holes: [
          {
            kind: 'window',
            width: 1,
            height: 1.4,
            along: 1.5,
          },
        ],
      },
    },
  },
  // Left block — east hole toward vertical street
  {
    id: 'house-left-large',
    centerX: -36,
    centerZ: 6,
    width: 22,
    depth: 14,
    material: PLASTER,
    walls: {
      east: {
        holes: [
          {
            kind: 'door',
            width: HOLE,
            along: 3.5,
          },
          {
            kind: 'window',
            width: 1.6,
            height: 1.2,
            along: -3.5,
          },
        ],
      },
      north: {
        holes: [
          {
            kind: 'door',
            width: HOLE,
            along: -6.5,
          },
          {
            kind: 'window',
            width: 2.5,
            height: 1.2,
            along: 7.5,
          },
        ],
      },
      west: {
        hole: { width: 1.2, height: 1.0 },
      },
    },
  },
  // Center — small holes on street-facing sides
  {
    id: 'house-center-tall',
    centerX: -2,
    centerZ: 7,
    width: 20,
    depth: 16,
    material: PLASTER,
    walls: {
      west: {
        holes: [{
          kind: 'window',
          width: 2,
          height: 2,
          along: 6,
        }],
      },
      north: {
        holes: [
          {
            kind: 'door',
            width: HOLE,
            along: -6.5,
          },
          {
            kind: 'window',
            width: 1.6,
            height: 1.2,
            along: 6.5,
          },
        ],
      },
      east: { hole: HOLE },
      south: { hole: { width: 1.2, height: 1.2 } },
    },
  },
  {
    id: 'house-center-bottom',
    centerX: -1,
    centerZ: 20,
    width: 14,
    depth: 6,
    material: PLASTER,
    walls: {
      north: { hole: HOLE },
      west: {
        holes: [
          {
            kind: 'window',
            width: 1.5,
            height: 1.4,
            along: -1.8,
          },
        ],
      },
      east: {
        holes: [
          {
            kind: 'window',
            width: 1.3,
            height: 1.4,
            along: 1,
          },
        ],
      },
    },
  },
  // Right block — west hole toward vertical street
  {
    id: 'house-right-tall',
    centerX: 38,
    centerZ: 3,
    width: 18,
    depth: 16,
    material: FORT,
    walls: {
      west: {
        holes: [
          {
            kind: 'door',
            width: HOLE,
            along: 5.5,
          },
          {
            kind: 'window',
            width: 1.6,
            height: 1.2,
            along: -6.5,
          },
        ],
      },
      north: {
        holes: [
          {
            kind: 'window',
            width: 1.6,
            height: 1.2,
            along: -7.5,
          },
          {
            kind: 'door',
            width: HOLE,
            along: 5.5,
          },
        ],
      },
    },
  },
  {
    id: 'house-br',
    centerX: 37,
    centerZ: 20,
    width: 14,
    depth: 6,
    material: PLASTER,
    walls: { north: { hole: HOLE }, west: { hole: HOLE } },
  },
];

const built = buildHouses(arena01Houses);

export const arena01HouseFloors: ScenarioFloorZone[] = built.floors;

export const arena01Walls: ScenarioWallSegment[] = built.walls;

export const arena01Holes: CollisionHole[] = built.holes;

/** Interior colliders for player movement; doorway holes remain passable. */
export const arena01Collisions: CollisionSegment[] = buildCollisionSegments(arena01Walls);
