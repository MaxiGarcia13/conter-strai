import type { ScenarioWallSegment } from '../types';
import type { WallMaterialId } from './constants';
import { WALL_HEIGHT } from './constants';

type XZ = [number, number];

export interface WallPieceTemplate {
  id: string;
  assetId: WallMaterialId;
  length: number;
  height: number;
}

/** Catalog of standard wall stubs for reuse across scenarios. */
export const WALL_PIECES = {
  fortLongFull: {
    id: 'fort-long-full',
    assetId: 'coral_fort_wall',
    length: 12,
    height: WALL_HEIGHT.full,
  },
  fortLongMid: {
    id: 'fort-long-mid',
    assetId: 'coral_fort_wall',
    length: 12,
    height: WALL_HEIGHT.mid,
  },
  fortLongLow: {
    id: 'fort-long-low',
    assetId: 'coral_fort_wall',
    length: 12,
    height: WALL_HEIGHT.low,
  },
  fortShortMid: {
    id: 'fort-short-mid',
    assetId: 'coral_fort_wall',
    length: 6,
    height: WALL_HEIGHT.mid,
  },
  fortShortLow: {
    id: 'fort-short-low',
    assetId: 'coral_fort_wall',
    length: 6,
    height: WALL_HEIGHT.low,
  },
  plasterLongFull: {
    id: 'plaster-long-full',
    assetId: 'damaged_plaster',
    length: 12,
    height: WALL_HEIGHT.full,
  },
  plasterLongMid: {
    id: 'plaster-long-mid',
    assetId: 'damaged_plaster',
    length: 12,
    height: WALL_HEIGHT.mid,
  },
  plasterLongLow: {
    id: 'plaster-long-low',
    assetId: 'damaged_plaster',
    length: 12,
    height: WALL_HEIGHT.low,
  },
  plasterShortMid: {
    id: 'plaster-short-mid',
    assetId: 'damaged_plaster',
    length: 6,
    height: WALL_HEIGHT.mid,
  },
  plasterShortLow: {
    id: 'plaster-short-low',
    assetId: 'damaged_plaster',
    length: 6,
    height: WALL_HEIGHT.low,
  },
} as const satisfies Record<string, WallPieceTemplate>;

/** Wall centered on XZ, aligned along the X axis. */
export function wallAlongX(
  centerX: number,
  z: number,
  length: number,
  height: number,
  assetId: WallMaterialId,
  id?: string,
): ScenarioWallSegment {
  const half = length / 2;
  return {
    id,
    start: [centerX - half, 0, z],
    end: [centerX + half, 0, z],
    height,
    assetId,
  };
}

/** Wall centered on XZ, aligned along the Z axis. */
export function wallAlongZ(
  x: number,
  centerZ: number,
  length: number,
  height: number,
  assetId: WallMaterialId,
  id?: string,
): ScenarioWallSegment {
  const half = length / 2;
  return {
    id,
    start: [x, 0, centerZ - half],
    end: [x, 0, centerZ + half],
    height,
    assetId,
  };
}

/** Wall between two ground corners. */
export function wallBetween(
  start: XZ,
  end: XZ,
  height: number,
  assetId: WallMaterialId,
  id?: string,
): ScenarioWallSegment {
  return {
    id,
    start: [start[0], 0, start[1]],
    end: [end[0], 0, end[1]],
    height,
    assetId,
  };
}

/** Place a catalog piece along X or Z from its center. */
export function placeWallPiece(
  piece: WallPieceTemplate,
  centerX: number,
  centerZ: number,
  axis: 'x' | 'z',
  id?: string,
): ScenarioWallSegment {
  if (axis === 'x') {
    return wallAlongX(centerX, centerZ, piece.length, piece.height, piece.assetId, id ?? piece.id);
  }
  return wallAlongZ(centerX, centerZ, piece.length, piece.height, piece.assetId, id ?? piece.id);
}
