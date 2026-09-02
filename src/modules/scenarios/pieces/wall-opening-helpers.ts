import type { CollisionAxis, CollisionHole } from '../types';
import type { HouseSide, WallHoleSpec } from './house-helpers';

/** Default window sill height above ground (m). */
export const WINDOW_DEFAULT_BOTTOM = 1.0;

const END_REMNANT = 0.3;
const ADJACENT_GAP = 0.6;

/** Opening spec after defaults: `along` is always set (0 when omitted). */
export type PlacedHoleSpec = WallHoleSpec & { along: number };

function placeOpening(spec: WallHoleSpec): PlacedHoleSpec {
  return { ...spec, along: spec.along ?? 0 };
}

/** Normalize a `HouseSide` into placed openings. `holes` wins over `hole`. */
export function normalizeOpenings(side: HouseSide | undefined): PlacedHoleSpec[] {
  if (!side || side === 'full' || side === 'open') {
    return [];
  }
  if (side.holes) {
    return side.holes.map(placeOpening);
  }
  if (typeof side.hole === 'number' && side.hole >= 0) {
    return [{ kind: 'door' as const, width: side.hole, along: 0 }];
  }
  if (side.hole && typeof side.hole === 'object') {
    const win = side.hole;
    return [{
      kind: 'window' as const,
      width: win.width,
      height: win.height,
      bottom: win.bottom ?? WINDOW_DEFAULT_BOTTOM,
      along: 0,
    }];
  }
  return [];
}

/** Sorted openings vs wall remnant, adjacent gap, and window height. */
export function validateOpenings(
  sorted: PlacedHoleSpec[],
  totalLength: number,
  wallHeight: number,
): boolean {
  const half = totalLength / 2;
  let prev: PlacedHoleSpec | undefined;
  for (const spec of sorted) {
    const halfW = spec.width / 2;
    if (Math.abs(spec.along) + halfW > half - END_REMNANT)
      return false;
    if (spec.kind === 'window' && (spec.bottom ?? WINDOW_DEFAULT_BOTTOM) + spec.height >= wallHeight - 0.1)
      return false;
    if (prev) {
      const gap = spec.along - halfW - (prev.along + prev.width / 2);
      if (gap < ADJACENT_GAP)
        return false;
    }
    prev = spec;
  }
  return true;
}

export function collisionHole(
  side: HouseSide | undefined,
  axis: CollisionAxis,
  center: [number, number, number],
  totalLength: number,
  wallHeight: number,
): CollisionHole[] {
  const sorted = normalizeOpenings(side).sort((a, b) => a.along - b.along);
  if (sorted.length === 0)
    return [];

  // Invalid openings fall back to a solid wall — no passable holes.
  if (!validateOpenings(sorted, totalLength, wallHeight))
    return [];

  const holes: CollisionHole[] = [];
  for (const spec of sorted) {
    if (spec.kind !== 'door') {
      continue;
    }
    if (axis === 'x') {
      holes.push({ axis, center: [center[0] + spec.along, center[1], center[2]], width: spec.width });
    } else {
      holes.push({ axis, center: [center[0], center[1], center[2] + spec.along], width: spec.width });
    }
  }
  return holes;
}
