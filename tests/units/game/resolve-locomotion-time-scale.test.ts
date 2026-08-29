import { describe, expect, it } from 'vitest';
import {
  LOCOMOTION_CLIP_REFERENCE_SPEED,
  RUN_BACKWARD_SPEED,
  RUN_SPEED,
  WALK_BACKWARD_SPEED,
  WALK_SPEED,
} from '@/modules/game/constants/locomotion';
import { expectedLocomotionSpeed } from '@/modules/game/utils/expected-locomotion-speed';
import { resolveLocomotionTimeScale } from '@/modules/game/utils/resolve-locomotion-time-scale';

describe('expectedLocomotionSpeed', () => {
  it('maps locomotion states to player speed constants', () => {
    expect(expectedLocomotionSpeed('idle')).toBeNull();
    expect(expectedLocomotionSpeed('walk')).toBe(WALK_SPEED);
    expect(expectedLocomotionSpeed('crouchWalking')).toBe(WALK_SPEED);
    expect(expectedLocomotionSpeed('run')).toBe(RUN_SPEED);
    expect(expectedLocomotionSpeed('walkBackward')).toBe(WALK_BACKWARD_SPEED);
    expect(expectedLocomotionSpeed('runBackward')).toBe(RUN_BACKWARD_SPEED);
  });
});

describe('resolveLocomotionTimeScale', () => {
  it('returns 1 for idle', () => {
    expect(resolveLocomotionTimeScale('idle')).toBe(1);
  });

  it('scales walk and run to match configured speeds', () => {
    expect(resolveLocomotionTimeScale('walk')).toBeCloseTo(
      WALK_SPEED / LOCOMOTION_CLIP_REFERENCE_SPEED.walk!,
    );
    expect(resolveLocomotionTimeScale('run')).toBeCloseTo(
      RUN_SPEED / LOCOMOTION_CLIP_REFERENCE_SPEED.run!,
    );
  });

  it('scales backward gaits from their reference speeds', () => {
    expect(resolveLocomotionTimeScale('walkBackward')).toBeCloseTo(
      WALK_BACKWARD_SPEED / LOCOMOTION_CLIP_REFERENCE_SPEED.walkBackward!,
    );
    expect(resolveLocomotionTimeScale('runBackward')).toBeCloseTo(
      RUN_BACKWARD_SPEED / LOCOMOTION_CLIP_REFERENCE_SPEED.runBackward!,
    );
  });
});
