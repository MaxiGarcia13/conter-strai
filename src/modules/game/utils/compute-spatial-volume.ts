import {
  COMBAT_SOUND_MAX_DISTANCE,
  COMBAT_SOUND_MIN_VOLUME,
} from '../constants/combat-sounds';

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

/** Linear falloff from full volume at the listener to `minVolume` at `maxDistance`. */
export function computeSpatialVolume(
  source: Vec3,
  listener: Vec3,
  maxDistance = COMBAT_SOUND_MAX_DISTANCE,
  minVolume = COMBAT_SOUND_MIN_VOLUME,
): number {
  const distance = Math.hypot(
    source.x - listener.x,
    source.y - listener.y,
    source.z - listener.z,
  );
  if (distance >= maxDistance) {
    return minVolume;
  }
  const t = distance / maxDistance;
  return Math.max(minVolume, 1 - t);
}
