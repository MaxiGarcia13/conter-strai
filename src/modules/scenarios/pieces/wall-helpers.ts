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
