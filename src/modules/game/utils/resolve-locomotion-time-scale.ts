import type { LocomotionState } from '@/modules/soldiers';
import { LOCOMOTION_CLIP_REFERENCE_SPEED } from '../constants/locomotion';
import { expectedLocomotionSpeed } from './expected-locomotion-speed';

/** Scales locomotion clip playback so feet match configured movement speeds. */
export function resolveLocomotionTimeScale(locomotion: LocomotionState): number {
  const expected = expectedLocomotionSpeed(locomotion);
  if (expected === null) {
    return 1;
  }

  const reference = LOCOMOTION_CLIP_REFERENCE_SPEED[locomotion];
  if (!reference) {
    return 1;
  }

  return expected / reference;
}
