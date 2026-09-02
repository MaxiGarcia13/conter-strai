import type { CollisionHole, ScenarioFloorZone, ScenarioWallSegment } from '../types';
import type { WALL_HEIGHT, WallMaterialId } from './constants';
import type { TextureId } from '@/modules/textures';
import { FLOOR_MATERIAL } from './constants';
import { floorZone } from './floor-helpers';
import { collisionHole, wallSegmentsAlongX, wallSegmentsAlongZ } from './wall-segment-helpers';

/** Default doorway / blast-hole width (meters). */
export const WALL_HOLE_WIDTH = 2.2;

/** Interior floor inset from each wall (meters) so tiles don't bleed into the street. */
export const HOUSE_FLOOR_INSET = 0.45;

export type HouseWallHeight = keyof typeof WALL_HEIGHT;

/** Door: full-height passable opening (meters). */
export type WallDoorHole = number;

/** Window: partial-height blocked opening. */
export interface WallWindowHole {
  width: number;
  height: number;
  /** Sill height above ground (m). Default: 1.0 */
  bottom?: number;
}

export type WallOpening = WallDoorHole | WallWindowHole;

/** Door opening spec with optional horizontal offset. */
export interface WallDoorSpec {
  kind: 'door';
  width: number;
  /** Meters from wall center along the wall axis. Default: 0 */
  along?: number;
}

/** Window opening spec with optional horizontal offset. */
export interface WallWindowSpec {
  kind: 'window';
  width: number;
  height: number;
  /** Sill height above ground (m). Default: 1.0 */
  bottom?: number;
  /** Meters from wall center along the wall axis. Default: 0 */
  along?: number;
}

export type WallHoleSpec = WallDoorSpec | WallWindowSpec;

/**
 * A wall edge: `'full'` solid, `'open'` no wall/collision, or a spec with an
 * optional centered `hole` (US-14 shorthand) or multiple `holes` (US-15),
 * plus per-side `height`.
 */
export type HouseSide
  = | 'full'
    | 'open'
    | { hole?: WallOpening; holes?: WallHoleSpec[]; height?: HouseWallHeight };

export interface HouseWalls {
  north?: HouseSide;
  south?: HouseSide;
  east?: HouseSide;
  west?: HouseSide;
}

export interface HouseFootprint {
  id: string;
  centerX: number;
  centerZ: number;
  width: number;
  depth: number;
  material: WallMaterialId;
  /** House-level wall height; sides fall back to this, then `WALL_HEIGHT.full`. */
  height?: HouseWallHeight;
  /** Floor material override; defaults to `FLOOR_MATERIAL.tile`. */
  floorAssetId?: TextureId;
  /** Interior floor inset from each wall; defaults to `HOUSE_FLOOR_INSET`. */
  floorInset?: number;
  /** Sides default to full walls; add `{ hole }` for a small opening or `'open'` to remove the edge. */
  walls?: HouseWalls;
}

/** Height for a side, falling back to the house default then `full`. */
function sideHeight(house: HouseFootprint, side: HouseSide | undefined): HouseWallHeight {
  if (side && side !== 'full' && side !== 'open' && side.height) {
    return side.height;
  }
  return house.height ?? 'full';
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
    ...wallSegmentsAlongX(northZ, centerX, width, walls.north ?? 'full', material, `${id}-north`, sideHeight(house, walls.north)),
    ...wallSegmentsAlongX(southZ, centerX, width, walls.south ?? 'full', material, `${id}-south`, sideHeight(house, walls.south)),
    ...wallSegmentsAlongZ(westX, centerZ, depth, walls.west ?? 'full', material, `${id}-west`, sideHeight(house, walls.west)),
    ...wallSegmentsAlongZ(eastX, centerZ, depth, walls.east ?? 'full', material, `${id}-east`, sideHeight(house, walls.east)),
  ];

  const inset = house.floorInset ?? HOUSE_FLOOR_INSET;
  const floorWidth = Math.max(width - inset * 2, 0);
  const floorDepth = Math.max(depth - inset * 2, 0);

  return {
    floor: floorZone(
      `${id}-floor`,
      house.floorAssetId ?? FLOOR_MATERIAL.tile,
      centerX,
      centerZ,
      floorWidth,
      floorDepth,
    ),
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
