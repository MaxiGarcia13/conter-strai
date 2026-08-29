import type { LocomotionState } from '@/modules/soldiers';

/** Forward walk speed (m/s). */
export const WALK_SPEED = 4;
export const RUN_SPEED = 6;
/** Backpedal is slower than forward (Mixamo backward gaits). */
export const WALK_BACKWARD_SPEED = WALK_SPEED * 0.7;
/** Backpedal run is slower than forward run. */
export const RUN_BACKWARD_SPEED = RUN_SPEED * 0.6;

/**
 * World speed (m/s) at which each shared-pack locomotion clip looks grounded at
 * timeScale 1 (Mixamo in-place, hips translation stripped). Tune when movement
 * speeds or `base-animations.glb` gaits change.
 */
export const LOCOMOTION_CLIP_REFERENCE_SPEED: Partial<Record<LocomotionState, number>> = {
  walk: 7,
  run: 7,
  crouchWalking: 5,
  walkBackward: 5,
  runBackward: 5,
};
