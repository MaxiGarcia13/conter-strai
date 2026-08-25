import { describe, expect, it } from 'vitest';
import {
  COMBAT_SOUND_MAX_DISTANCE,
  COMBAT_SOUND_MIN_VOLUME,
} from '@/modules/game/constants/combat-sounds';
import { computeSpatialVolume } from '@/modules/game/utils/compute-spatial-volume';

describe('computeSpatialVolume', () => {
  const listener = { x: 0, y: 0, z: 0 };

  it('returns full volume when source equals listener', () => {
    expect(computeSpatialVolume(listener, listener)).toBe(1);
  });

  it('linearly falls off with distance', () => {
    const halfDistance = COMBAT_SOUND_MAX_DISTANCE / 2;
    expect(computeSpatialVolume({ x: halfDistance, y: 0, z: 0 }, listener)).toBeCloseTo(0.5);
  });

  it('clamps to min volume at and beyond max distance', () => {
    expect(
      computeSpatialVolume(
        { x: COMBAT_SOUND_MAX_DISTANCE, y: 0, z: 0 },
        listener,
      ),
    ).toBe(COMBAT_SOUND_MIN_VOLUME);
    expect(
      computeSpatialVolume(
        { x: COMBAT_SOUND_MAX_DISTANCE + 10, y: 0, z: 0 },
        listener,
      ),
    ).toBe(COMBAT_SOUND_MIN_VOLUME);
  });
});
