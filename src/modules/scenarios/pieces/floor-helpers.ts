import type { ScenarioFloorZone } from '../types';
import type { TextureId } from '@/modules/textures';
import { FLOOR_TILE_SIZE } from './constants';

export interface FloorPieceTemplate {
  id: string;
  assetId: TextureId;
  size: [number, number];
}

/** Catalog of standard interior / street floor pads. */
export const FLOOR_PIECES = {
  streetMain: {
    id: 'street-main',
    assetId: 'cobblestone_embedded_asphalt',
    size: [96, 8],
  },
  houseSmall: {
    id: 'house-small',
    assetId: 'brown_floor_tiles',
    size: [11, 9],
  },
  houseMedium: {
    id: 'house-medium',
    assetId: 'brown_floor_tiles',
    size: [13, 9],
  },
} as const satisfies Record<string, FloorPieceTemplate>;

function repeatForSize(size: [number, number]): [number, number] {
  return [size[0] / FLOOR_TILE_SIZE, size[1] / FLOOR_TILE_SIZE];
}

export function floorZone(
  id: string,
  assetId: TextureId,
  centerX: number,
  centerZ: number,
  width: number,
  depth: number,
): ScenarioFloorZone {
  const size: [number, number] = [width, depth];
  return {
    id,
    assetId,
    position: [centerX, 0, centerZ],
    size,
    repeat: repeatForSize(size),
  };
}

export function placeFloorPiece(
  piece: FloorPieceTemplate,
  centerX: number,
  centerZ: number,
  id?: string,
): ScenarioFloorZone {
  return floorZone(id ?? piece.id, piece.assetId, centerX, centerZ, piece.size[0], piece.size[1]);
}
