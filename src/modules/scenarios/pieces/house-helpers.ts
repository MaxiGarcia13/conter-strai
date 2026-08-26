import type { CollisionHole, ScenarioFloorZone, ScenarioWallSegment } from '../types';
import type { WallMaterialId } from './constants';
import { FLOOR_MATERIAL } from './constants';
import { floorZone } from './floor-helpers';
import { collisionHole, wallSegmentsAlongX, wallSegmentsAlongZ } from './wall-segment-helpers';

/** Default doorway / blast-hole width (meters). */
export const WALL_HOLE_WIDTH = 2.2;

/** Full wall or a centered gap small enough to slip through but not shoot across easily. */
export type HouseSide = 'full' | { hole: number };

export interface HouseFootprint {
  id: string;
  centerX: number;
  centerZ: number;
  width: number;
  depth: number;
  material: WallMaterialId;
  /** Sides default to full walls; add `{ hole }` for a small opening only. */
  walls?: {
    north?: HouseSide;
    south?: HouseSide;
    east?: HouseSide;
    west?: HouseSide;
  };
}

/** Floor zone + perimeter walls with optional small holes per side. */
function houseFootprint(house: HouseFootprint): {
  floor: ScenarioFloorZone;
  walls: ScenarioWallSegment[];
  holes: CollisionHole[];
} {
  const { id, centerX, centerZ, width, depth, material, walls = {} } = house;
  const halfW = width / 2;
  const halfD = depth / 2;
  const northZ = centerZ - halfD;
  const southZ = centerZ + halfD;
  const westX = centerX - halfW;
  const eastX = centerX + halfW;
  const holes: CollisionHole[] = [
    ...collisionHole(walls.north, 'x', [centerX, 0, northZ], width),
    ...collisionHole(walls.south, 'x', [centerX, 0, southZ], width),
    ...collisionHole(walls.west, 'z', [westX, 0, centerZ], depth),
    ...collisionHole(walls.east, 'z', [eastX, 0, centerZ], depth),
  ];

  const segments: ScenarioWallSegment[] = [
    ...wallSegmentsAlongX(northZ, centerX, width, walls.north ?? 'full', material, `${id}-north`),
    ...wallSegmentsAlongX(southZ, centerX, width, walls.south ?? 'full', material, `${id}-south`),
    ...wallSegmentsAlongZ(westX, centerZ, depth, walls.west ?? 'full', material, `${id}-west`),
    ...wallSegmentsAlongZ(eastX, centerZ, depth, walls.east ?? 'full', material, `${id}-east`),
  ];

  return {
    floor: floorZone(`${id}-floor`, FLOOR_MATERIAL.tile, centerX, centerZ, width, depth),
    walls: segments,
    holes,
  };
}

export function buildHouses(houses: HouseFootprint[]): {
  floors: ScenarioFloorZone[];
  walls: ScenarioWallSegment[];
  holes: CollisionHole[];
} {
  const floors: ScenarioFloorZone[] = [];
  const wallSegments: ScenarioWallSegment[] = [];
  const holes: CollisionHole[] = [];
  for (const house of houses) {
    const built = houseFootprint(house);
    floors.push(built.floor);
    wallSegments.push(...built.walls);
    holes.push(...built.holes);
  }
  return { floors, walls: wallSegments, holes };
}
