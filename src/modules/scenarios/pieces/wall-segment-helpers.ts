import type { ScenarioWallSegment } from '../types';
import type { WallMaterialId } from './constants';
import type { HouseSide, HouseWallHeight, WallWindowSpec } from './house-helpers';
import { WALL_HEIGHT } from './constants';
import { wallAlongX, wallAlongZ } from './wall-helpers';
import {
  normalizeOpenings,
  validateOpenings,
  WINDOW_DEFAULT_BOTTOM,
} from './wall-opening-helpers';

/** Solid-span id suffix: `-0 → -a`, `-1 → -b`. */
function spanId(prefix: string, index: number): string {
  return `${prefix}-${String.fromCharCode(97 + index)}`;
}

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

type WallSegmentFn = (along: number, fixed: number, length: number, height: number, assetId: WallMaterialId, id?: string, baseY?: number) => ScenarioWallSegment;

function emitWindowSegment(
  make: WallSegmentFn,
  along: number,
  fixed: number,
  opening: WallWindowSpec,
  height: number,
  material: WallMaterialId,
  idPrefix: string,
): ScenarioWallSegment[] {
  const bottom = opening.bottom ?? WINDOW_DEFAULT_BOTTOM;
  const lintelHeight = height - bottom - opening.height;
  return [
    make(along, fixed, opening.width, bottom, material, `${idPrefix}-sill`),
    make(along, fixed, opening.width, lintelHeight, material, `${idPrefix}-lintel`, bottom + opening.height),
  ];
}

function wallSegmentsFromOpenings(
  make: WallSegmentFn,
  fixedCoord: number,
  centerCoord: number,
  totalLength: number,
  side: HouseSide | undefined,
  material: WallMaterialId,
  idPrefix: string,
  fallbackHeight: HouseWallHeight = 'full',
): ScenarioWallSegment[] {
  if (side === 'open')
    return [];

  const height = sideHeight(side, fallbackHeight);
  const openings = normalizeOpenings(side);
  openings.sort((a, b) => a.along - b.along);

  if (openings.length === 0 || !validateOpenings(openings, totalLength, height)) {
    return [make(centerCoord, fixedCoord, totalLength, height, material, idPrefix)];
  }

  const half = totalLength / 2;
  const segments: ScenarioWallSegment[] = [];
  let cursor = -half;
  let idx = 0;

  for (const spec of openings) {
    const openStart = spec.along - spec.width / 2;
    if (openStart - cursor > 0) {
      const len = openStart - cursor;
      const center = cursor + len / 2;
      segments.push(make(center, fixedCoord, len, height, material, spanId(idPrefix, idx++)));
    }

    if (spec.kind === 'door') {
      // Passable gap — no segment
    } else {
      segments.push(...emitWindowSegment(make, spec.along, fixedCoord, spec, height, material, spanId(idPrefix, idx++)));
    }

    cursor = spec.along + spec.width / 2;
  }

  if (half - cursor > 0) {
    const len = half - cursor;
    const center = cursor + len / 2;
    segments.push(make(center, fixedCoord, len, height, material, spanId(idPrefix, idx++)));
  }

  return segments;
}

function wrapAlongX(z: number): WallSegmentFn {
  return (along, _fixed, length, height, assetId, id, baseY) => wallAlongX(along, z, length, height, assetId, id, baseY);
}

function wrapAlongZ(x: number): WallSegmentFn {
  return (along, _fixed, length, height, assetId, id, baseY) => wallAlongZ(x, along, length, height, assetId, id, baseY);
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
  return wallSegmentsFromOpenings(wrapAlongX(z), z, centerX, totalLength, side, material, idPrefix, fallbackHeight);
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
  return wallSegmentsFromOpenings(wrapAlongZ(x), x, centerZ, totalLength, side, material, idPrefix, fallbackHeight);
}
