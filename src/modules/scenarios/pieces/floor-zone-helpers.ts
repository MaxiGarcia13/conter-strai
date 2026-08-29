import type { ScenarioFloorZone } from '../types';

export interface FloorZoneBounds {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

export interface FloorOverlap {
  a: ScenarioFloorZone;
  b: ScenarioFloorZone;
}

/** Axis-aligned XZ bounds of a floor zone (Y is ignored; tiles sit at ±0.02). */
export function floorZoneBounds(zone: ScenarioFloorZone): FloorZoneBounds {
  const halfX = zone.size[0] / 2;
  const halfZ = zone.size[1] / 2;
  return {
    minX: zone.position[0] - halfX,
    maxX: zone.position[0] + halfX,
    minZ: zone.position[2] - halfZ,
    maxZ: zone.position[2] + halfZ,
  };
}

/** Strict area overlap; shared edges alone do not count (streets sit flush). */
export function zonesOverlap(a: ScenarioFloorZone, b: ScenarioFloorZone): boolean {
  const ab = floorZoneBounds(a);
  const bb = floorZoneBounds(b);
  return ab.minX < bb.maxX && ab.maxX > bb.minX && ab.minZ < bb.maxZ && ab.maxZ > bb.minZ;
}

export function findFloorOverlaps(zones: ScenarioFloorZone[]): FloorOverlap[] {
  const overlaps: FloorOverlap[] = [];
  for (let i = 0; i < zones.length; i += 1) {
    for (let j = i + 1; j < zones.length; j += 1) {
      if (zonesOverlap(zones[i]!, zones[j]!)) {
        overlaps.push({ a: zones[i]!, b: zones[j]! });
      }
    }
  }
  return overlaps;
}

export function assertNoFloorOverlaps(zones: ScenarioFloorZone[]): void {
  const overlaps = findFloorOverlaps(zones);
  if (overlaps.length > 0) {
    const detail = overlaps.map(({ a, b }) => `${a.id} vs ${b.id}`).join(', ');
    throw new Error(`Floor zones overlap: ${detail}`);
  }
}
