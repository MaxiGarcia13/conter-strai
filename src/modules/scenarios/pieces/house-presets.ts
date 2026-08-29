import type { WallMaterialId } from './constants';
import type { HouseFootprint, HouseSide, HouseWallHeight } from './house-helpers';
import type { TextureId } from '@/modules/textures';
import { FLOOR_MATERIAL, WALL_MATERIAL } from './constants';

const PLASTER = WALL_MATERIAL.plaster;
const FORT = WALL_MATERIAL.fort;
const TILE = FLOOR_MATERIAL.tile;

/**
 * Named destroyed-house variants. Presets carry look/height/wall layout but not
 * position; map authors supply `id` / `centerX` / `centerZ` (and any size/mat
 * overrides) via `applyHousePreset`.
 */
export interface HousePreset {
  width: number;
  depth: number;
  material: WallMaterialId;
  height?: HouseWallHeight;
  floorAssetId?: TextureId;
  floorInset?: number;
  walls?: {
    north?: HouseSide;
    south?: HouseSide;
    east?: HouseSide;
    west?: HouseSide;
  };
}

type HousePosition = Pick<HouseFootprint, 'id' | 'centerX' | 'centerZ'>
  & Partial<Pick<HouseFootprint, 'width' | 'depth' | 'material' | 'height' | 'floorAssetId' | 'floorInset' | 'walls'>>;

export function applyHousePreset(preset: HousePreset, position: HousePosition): HouseFootprint {
  return {
    ...preset,
    ...position,
  };
}

/** Small plaster cottage, mid walls, one open door side. */
export const ruinedCottage: HousePreset = {
  width: 12,
  depth: 7,
  material: PLASTER,
  height: 'mid',
  floorAssetId: TILE,
  walls: {
    north: { hole: 2.2, height: 'low' },
    south: 'open',
  },
};

/** Three-walled ruin at a block corner — two open sides facing the streets. */
export const cornerRuin: HousePreset = {
  width: 11,
  depth: 9,
  material: PLASTER,
  walls: {
    west: 'open',
    south: 'open',
    north: { hole: 2.2 },
    east: { hole: 2.2 },
  },
};

/** Tall fort-walled block with a single narrow doorway. */
export const fortifiedBlock: HousePreset = {
  width: 16,
  depth: 11,
  material: FORT,
  height: 'full',
  walls: {
    south: { hole: 2.2 },
  },
};

/** Small squat shack, low walls, big gap on one side. */
export const streetShack: HousePreset = {
  width: 8,
  depth: 6,
  material: PLASTER,
  height: 'low',
  walls: {
    north: 'open',
    east: { hole: 3 },
  },
};

/** Blast-through fort ruin with an open breach and a low far wall. */
export const bombedHouse: HousePreset = {
  width: 14,
  depth: 9,
  material: FORT,
  height: 'mid',
  walls: {
    north: 'open',
    south: { hole: 2.2, height: 'low' },
  },
};
