import type { CollisionAxis, CollisionHole, ScenarioWallSegment } from '../types';
import type { WallMaterialId } from './constants';
import type { HouseSide, HouseWallHeight } from './house-helpers';
import { WALL_HEIGHT } from './constants';
import { wallAlongX, wallAlongZ } from './wall-helpers';

/** Default window sill height above ground (m). */
export const WINDOW_DEFAULT_BOTTOM = 1.0;

function sideHeight(side: HouseSide | undefined, fallback: HouseWallHeight): number {
  const height = defaultHeight(side, fallback);
  return WALL_HEIGHT[height];
}

function defaultHeight(side: HouseSide | undefined, fallback: HouseWallHeight): HouseWallHeight {
  if (side && side !== 'full' && side !== 'open' && side.height) {
    return side.height;
  }
  return fallback;
}

/** Parsed opening from a wall side. */
export type ParsedOpening =
  | { kind: 'none' }
  | { kind: 'door'; width: number }
  | { kind: 'window'; width: number; height: number; bottom: number };

/** Extract the opening kind + geometry for a `HouseSide`. */
export function parseOpening(side: HouseSide | undefined): ParsedOpening {
  if (!side || side === 'full' || side === 'open') {
    return { kind: 'none' };
  }
  if (typeof side.hole === 'number') {
    return side.hole >= 0 ? { kind: 'door', width: side.hole } : { kind: 'none' };
  }
  if (side.hole && typeof side.hole === 'object') {
    return {
      kind: 'window',
      width: side.hole.width,
      height: side.hole.height,
      bottom: side.hole.bottom ?? WINDOW_DEFAULT_BOTTOM,
    };
  }
  return { kind: 'none' };
}

export function collisionHole(
  side: HouseSide | undefined,
  axis: CollisionAxis,
  center: [number, number, number],
  totalLength: number,
): CollisionHole[] {
  const opening = parseOpening(side);
  if (opening.kind !== 'door' || opening.width >= totalLength - 0.6) {
    return [];
  }
  return [{ axis, center, width: opening.width }];
}

/** Does this window fit within the wall, or fall back to a solid wall? */
function windowFits(opening: { width: number; height: number; bottom: number }, totalLength: number, wallHeight: number): boolean {
  return !(opening.width >= totalLength - 0.6 || opening.bottom + opening.height >= wallHeight - 0.1);
}

export function wallSegmentsAlongX(
  z: number,
  centerX: number,
  totalLength: number,
  side: HouseSide | undefined,
  material: WallMaterialId,
  idPrefix: string,
  fallbackHeight: HouseWallHeight = 'full',
): ScenarioWallSegment[] {
  if (side === 'open') {
    return [];
  }
  const height = sideHeight(side, fallbackHeight);
  const opening = parseOpening(side);

  if (opening.kind === 'window') {
    if (!windowFits(opening, totalLength, height)) {
      return [wallAlongX(centerX, z, totalLength, height, material, idPrefix)];
    }
    const segmentLength = (totalLength - opening.width) / 2;
    const pillarOffset = segmentLength / 2 + opening.width / 2;
    const lintelHeight = height - opening.bottom - opening.height;
    return [
      wallAlongX(centerX - pillarOffset, z, segmentLength, height, material, `${idPrefix}-a`),
      wallAlongX(centerX, z, opening.width, opening.bottom, material, `${idPrefix}-sill`),
      wallAlongX(centerX, z, opening.width, lintelHeight, material, `${idPrefix}-lintel`, opening.bottom + opening.height),
      wallAlongX(centerX + pillarOffset, z, segmentLength, height, material, `${idPrefix}-b`),
    ];
  }

  if (opening.kind !== 'door' || opening.width >= totalLength - 0.6) {
    return [wallAlongX(centerX, z, totalLength, height, material, idPrefix)];
  }
  const gap = opening.width;
  const segmentLength = (totalLength - gap) / 2;
  const offset = segmentLength / 2 + gap / 2;
  return [
    wallAlongX(centerX - offset, z, segmentLength, height, material, `${idPrefix}-a`),
    wallAlongX(centerX + offset, z, segmentLength, height, material, `${idPrefix}-b`),
  ];
}

export function wallSegmentsAlongZ(
  x: number,
  centerZ: number,
  totalLength: number,
  side: HouseSide | undefined,
  material: WallMaterialId,
  idPrefix: string,
  fallbackHeight: HouseWallHeight = 'full',
): ScenarioWallSegment[] {
  if (side === 'open') {
    return [];
  }
  const height = sideHeight(side, fallbackHeight);
  const opening = parseOpening(side);

  if (opening.kind === 'window') {
    if (!windowFits(opening, totalLength, height)) {
      return [wallAlongZ(x, centerZ, totalLength, height, material, idPrefix)];
    }
    const segmentLength = (totalLength - opening.width) / 2;
    const pillarOffset = segmentLength / 2 + opening.width / 2;
    const lintelHeight = height - opening.bottom - opening.height;
    return [
      wallAlongZ(x, centerZ - pillarOffset, segmentLength, height, material, `${idPrefix}-a`),
      wallAlongZ(x, centerZ, opening.width, opening.bottom, material, `${idPrefix}-sill`),
      wallAlongZ(x, centerZ, opening.width, lintelHeight, material, `${idPrefix}-lintel`, opening.bottom + opening.height),
      wallAlongZ(x, centerZ + pillarOffset, segmentLength, height, material, `${idPrefix}-b`),
    ];
  }

  if (opening.kind !== 'door' || opening.width >= totalLength - 0.6) {
    return [wallAlongZ(x, centerZ, totalLength, height, material, idPrefix)];
  }
  const gap = opening.width;
  const segmentLength = (totalLength - gap) / 2;
  const offset = segmentLength / 2 + gap / 2;
  return [
    wallAlongZ(x, centerZ - offset, segmentLength, height, material, `${idPrefix}-a`),
    wallAlongZ(x, centerZ + offset, segmentLength, height, material, `${idPrefix}-b`),
  ];
}
