import type { HouseFootprint } from '@/modules/scenarios/pieces/house-helpers';
import type { ScenarioFloorZone, ScenarioWallSegment } from '@/modules/scenarios/types';
import { WALL_MATERIAL } from '@/modules/scenarios/pieces/constants';
import { floorZone } from '@/modules/scenarios/pieces/floor-helpers';
import { buildHouses, WALL_HOLE_WIDTH } from '@/modules/scenarios/pieces/house-helpers';

const PLASTER = WALL_MATERIAL.plaster;
const FORT = WALL_MATERIAL.fort;
const HOLE = WALL_HOLE_WIDTH;

/** Street grid matching the ruined-village diagram (green rectangles). */
const arena01Streets: ScenarioFloorZone[] = [
  floorZone('street-main', 'asphalt', 0, -8, 92, 6),
  floorZone('street-v-left', 'asphalt', -22, 6, 6, 28),
  floorZone('street-v-right', 'asphalt', 26, 5, 6, 30),
  floorZone('street-bl', 'asphalt', -36, 17, 26, 6),
  floorZone('street-r-spur', 'asphalt', 39, 14, 18, 6),
];

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
    walls: { south: { hole: HOLE } },
  },
  {
    id: 'house-tlc',
    centerX: -26,
    centerZ: -18,
    width: 14,
    depth: 8,
    material: PLASTER,
    walls: { south: { hole: HOLE } },
  },
  {
    id: 'house-trc',
    centerX: -8,
    centerZ: -18,
    width: 16,
    depth: 8,
    material: PLASTER,
    walls: { south: { hole: HOLE } },
  },
  {
    id: 'house-tr',
    centerX: 14,
    centerZ: -18,
    width: 14,
    depth: 8,
    material: PLASTER,
    walls: { south: { hole: HOLE } },
  },
  // Left block — east hole toward vertical street
  {
    id: 'house-left-large',
    centerX: -36,
    centerZ: 6,
    width: 22,
    depth: 14,
    material: PLASTER,
    walls: { east: { hole: HOLE }, south: { hole: HOLE } },
  },
  // Center — small holes on street-facing sides
  {
    id: 'house-center-tall',
    centerX: -2,
    centerZ: 7,
    width: 20,
    depth: 16,
    material: PLASTER,
    walls: { north: { hole: HOLE }, east: { hole: HOLE } },
  },
  {
    id: 'house-center-bottom',
    centerX: -1,
    centerZ: 20,
    width: 14,
    depth: 6,
    material: PLASTER,
    walls: { north: { hole: HOLE } },
  },
  // Right block — west hole toward vertical street
  {
    id: 'house-right-tall',
    centerX: 38,
    centerZ: 5,
    width: 18,
    depth: 22,
    material: FORT,
    walls: { west: { hole: HOLE }, north: { hole: HOLE } },
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

export const arena01Floors: ScenarioFloorZone[] = [...arena01Streets, ...built.floors];

export const arena01Walls: ScenarioWallSegment[] = built.walls;
