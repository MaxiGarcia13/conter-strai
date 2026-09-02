import type { ScenarioWallSegment } from '../types';
import type { WallMaterialId } from './constants';

/** Wall centered on XZ, aligned along the X axis. */
export function wallAlongX(
  centerX: number,
  z: number,
  length: number,
  height: number,
  assetId: WallMaterialId,
  id?: string,
  baseY = 0,
): ScenarioWallSegment {
  const half = length / 2;
  return {
    id,
    start: [centerX - half, baseY, z],
    end: [centerX + half, baseY, z],
    height,
    baseY,
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
  baseY = 0,
): ScenarioWallSegment {
  const half = length / 2;
  return {
    id,
    start: [x, baseY, centerZ - half],
    end: [x, baseY, centerZ + half],
    height,
    baseY,
    assetId,
  };
}
