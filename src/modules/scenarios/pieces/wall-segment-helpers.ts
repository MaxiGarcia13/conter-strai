import type { CollisionAxis, CollisionHole, ScenarioWallSegment } from '../types';
import type { WallMaterialId } from './constants';
import type { HouseSide } from './house-helpers';
import { WALL_HEIGHT } from './constants';
import { wallAlongX, wallAlongZ } from './wall-helpers';

const H = WALL_HEIGHT.full;

export function holeWidth(side: HouseSide | undefined): number | null {
  if (!side || side === 'full') {
    return null;
  }
  return side.hole;
}

export function collisionHole(
  side: HouseSide | undefined,
  axis: CollisionAxis,
  center: [number, number, number],
  totalLength: number,
): CollisionHole[] {
  const width = holeWidth(side);
  if (width === null || width >= totalLength - 0.6) {
    return [];
  }
  return [{ axis, center, width }];
}

export function wallSegmentsAlongX(
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

export function wallSegmentsAlongZ(
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
