import type { ScenarioWallSegment, Vec3 } from '../types';
import type { TextureId } from '@/modules/textures';

/** Shared endpoint closer than this (meters) counts as a wall union. */
const ENDPOINT_EPS = 0.05;

/** Directions with |dot| below this are treated as perpendicular. */
const PERPENDICULAR_EPS = 0.01;

export interface WallCorner {
  position: Vec3;
  height: number;
  assetId: TextureId;
}

function pointsMeet(a: Vec3, b: Vec3): boolean {
  return Math.hypot(a[0] - b[0], a[2] - b[2]) < ENDPOINT_EPS;
}

function segmentLength(segment: ScenarioWallSegment): number {
  return Math.hypot(segment.end[0] - segment.start[0], segment.end[2] - segment.start[2]);
}

function direction(segment: ScenarioWallSegment): [number, number] | null {
  const dx = segment.end[0] - segment.start[0];
  const dz = segment.end[2] - segment.start[2];
  const length = Math.hypot(dx, dz);
  if (length < ENDPOINT_EPS) {
    return null;
  }
  return [dx / length, dz / length];
}

function isPerpendicular(a: ScenarioWallSegment, b: ScenarioWallSegment): boolean {
  const da = direction(a);
  const db = direction(b);
  if (!da || !db) {
    return false;
  }
  return Math.abs(da[0] * db[0] + da[1] * db[1]) < PERPENDICULAR_EPS;
}

function moveToward(from: Vec3, to: Vec3, distance: number): Vec3 {
  const dx = to[0] - from[0];
  const dz = to[2] - from[2];
  const length = Math.hypot(dx, dz);
  if (length < 1e-8) {
    return from;
  }
  const t = Math.min(distance / length, 1);
  return [from[0] + dx * t, from[1], from[2] + dz * t];
}

function cornerKey(position: Vec3): string {
  return `${position[0].toFixed(3)},${position[2].toFixed(3)}`;
}

/**
 * Square posts at 90° endpoint unions. Collision still uses the full authored
 * spans; this is visual-only so brick end-caps are hidden behind a column.
 */
export function findWallCorners(
  segments: ScenarioWallSegment[],
  defaultHeight: number,
  defaultAssetId: TextureId,
): WallCorner[] {
  const corners = new Map<string, WallCorner>();

  for (let i = 0; i < segments.length; i += 1) {
    const a = segments[i]!;
    if (segmentLength(a) < ENDPOINT_EPS) {
      continue;
    }
    for (let j = i + 1; j < segments.length; j += 1) {
      const b = segments[j]!;
      if (!isPerpendicular(a, b)) {
        continue;
      }
      for (const pa of [a.start, a.end]) {
        for (const pb of [b.start, b.end]) {
          if (!pointsMeet(pa, pb)) {
            continue;
          }
          const position: Vec3 = [(pa[0] + pb[0]) / 2, 0, (pa[2] + pb[2]) / 2];
          const height = Math.max(a.height ?? defaultHeight, b.height ?? defaultHeight);
          const assetId = a.assetId ?? b.assetId ?? defaultAssetId;
          const key = cornerKey(position);
          const existing = corners.get(key);
          if (existing) {
            existing.height = Math.max(existing.height, height);
            continue;
          }
          corners.set(key, { position, height, assetId });
        }
      }
    }
  }

  return [...corners.values()];
}

/** Pull a visual span off each endpoint that meets a corner post. */
export function trimSegmentEnds(
  segment: ScenarioWallSegment,
  corners: WallCorner[],
  thickness: number,
): { start: Vec3; end: Vec3 } {
  const length = segmentLength(segment);
  const maxTrim = Math.max(0, length / 2 - ENDPOINT_EPS);
  const trim = Math.min(thickness / 2, maxTrim);

  let { start, end } = segment;
  for (const corner of corners) {
    if (pointsMeet(start, corner.position)) {
      start = moveToward(start, end, trim);
    }
    if (pointsMeet(end, corner.position)) {
      end = moveToward(end, start, trim);
    }
  }
  return { start, end };
}
