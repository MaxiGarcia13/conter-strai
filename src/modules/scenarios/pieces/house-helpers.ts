import type { ScenarioFloorZone, ScenarioWallSegment } from '../types';
import type { WallMaterialId } from './constants';
import { FLOOR_MATERIAL, WALL_HEIGHT } from './constants';
import { floorZone } from './floor-helpers';
import { wallAlongX, wallAlongZ } from './wall-helpers';

const H = WALL_HEIGHT.full;

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

function holeWidth(side: HouseSide | undefined): number | null {
  if (!side || side === 'full') {
    return null;
  }
  return side.hole;
}

function wallSegmentsAlongX(
  z: number,
  centerX: number,
  totalLength: number,
  side: HouseSide | undefined,
  material: WallMaterialId,
  idPrefix: string,
): ScenarioWallSegment[] {
  const gap = holeWidth(side);
  if (gap === null || gap >= totalLength - 0.6) {
    return [wallAlongX(centerX, z, totalLength, H, material, idPrefix)];
  }
  const segmentLength = (totalLength - gap) / 2;
  const offset = segmentLength / 2 + gap / 2;
  return [
    wallAlongX(centerX - offset, z, segmentLength, H, material, `${idPrefix}-a`),
    wallAlongX(centerX + offset, z, segmentLength, H, material, `${idPrefix}-b`),
  ];
}

function wallSegmentsAlongZ(
  x: number,
  centerZ: number,
  totalLength: number,
  side: HouseSide | undefined,
  material: WallMaterialId,
  idPrefix: string,
): ScenarioWallSegment[] {
  const gap = holeWidth(side);
  if (gap === null || gap >= totalLength - 0.6) {
    return [wallAlongZ(x, centerZ, totalLength, H, material, idPrefix)];
  }
  const segmentLength = (totalLength - gap) / 2;
  const offset = segmentLength / 2 + gap / 2;
  return [
    wallAlongZ(x, centerZ - offset, segmentLength, H, material, `${idPrefix}-a`),
    wallAlongZ(x, centerZ + offset, segmentLength, H, material, `${idPrefix}-b`),
  ];
}

/** Floor zone + perimeter walls with optional small holes per side. */
function houseFootprint(house: HouseFootprint): {
  floor: ScenarioFloorZone;
  walls: ScenarioWallSegment[];
} {
  const { id, centerX, centerZ, width, depth, material, walls = {} } = house;
  const halfW = width / 2;
  const halfD = depth / 2;
  const northZ = centerZ - halfD;
  const southZ = centerZ + halfD;
  const westX = centerX - halfW;
  const eastX = centerX + halfW;

  const segments: ScenarioWallSegment[] = [
    ...wallSegmentsAlongX(northZ, centerX, width, walls.north ?? 'full', material, `${id}-north`),
    ...wallSegmentsAlongX(southZ, centerX, width, walls.south ?? 'full', material, `${id}-south`),
    ...wallSegmentsAlongZ(westX, centerZ, depth, walls.west ?? 'full', material, `${id}-west`),
    ...wallSegmentsAlongZ(eastX, centerZ, depth, walls.east ?? 'full', material, `${id}-east`),
  ];

  return {
    floor: floorZone(`${id}-floor`, FLOOR_MATERIAL.tile, centerX, centerZ, width, depth),
    walls: segments,
  };
}

export function buildHouses(houses: HouseFootprint[]): {
  floors: ScenarioFloorZone[];
  walls: ScenarioWallSegment[];
} {
  const floors: ScenarioFloorZone[] = [];
  const wallSegments: ScenarioWallSegment[] = [];
  for (const house of houses) {
    const built = houseFootprint(house);
    floors.push(built.floor);
    wallSegments.push(...built.walls);
  }
  return { floors, walls: wallSegments };
}
