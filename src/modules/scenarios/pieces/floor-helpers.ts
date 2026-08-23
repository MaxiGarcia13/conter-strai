import type { ScenarioFloorZone } from '../types';
import type { TextureId } from '@/modules/textures';
import { FLOOR_TILE_SIZE } from './constants';

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
