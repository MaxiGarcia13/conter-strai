import { beforeEach, describe, expect, it } from 'vitest';
import { LOOK_PITCH_FLOOR, MOUSE_SENSITIVITY, PITCH_LIMIT } from '@/modules/game/constants/player';
import { applyLookDelta } from '@/modules/game/input/utils/apply-look-delta';
import { getPlayerTransform, resetPlayerTransform } from '@/modules/game/stores/player-state';

describe('applyLookDelta', () => {
  beforeEach(() => {
    resetPlayerTransform(0, 0, 0);
  });

  it('yaws by a negative mouse delta (movementX right → yaw left)', () => {
    applyLookDelta(10, 0);
    expect(getPlayerTransform().yaw).toBeCloseTo(-10 * MOUSE_SENSITIVITY);
  });

  it('pitches up when dragging downward (movementY)', () => {
    applyLookDelta(0, 100);
    expect(getPlayerTransform().pitch).toBeCloseTo(-100 * MOUSE_SENSITIVITY);
  });

  it('clamps pitch to the upper limit', () => {
    applyLookDelta(0, -1_000_000);
    expect(getPlayerTransform().pitch).toBeCloseTo(PITCH_LIMIT);
  });

  it('does not pitch below the look floor (camera would clip the body)', () => {
    // Reaching the exact floor is allowed...
    applyLookDelta(0, -LOOK_PITCH_FLOOR / MOUSE_SENSITIVITY);
    expect(getPlayerTransform().pitch).toBeCloseTo(LOOK_PITCH_FLOOR);

    // ...but a further downward delta stays pinned at the floor.
    applyLookDelta(0, 100);
    expect(getPlayerTransform().pitch).toBeCloseTo(LOOK_PITCH_FLOOR);
  });
});
