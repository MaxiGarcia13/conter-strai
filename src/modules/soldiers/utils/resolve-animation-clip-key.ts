import type { LocomotionState, SoldierActionId } from '../types';

/**
 * Resolves the final animation clip key from the current pose and locomotion.
 * Kneel + run → run; kneel + walk → crouch-walk; kneel + idle → kneel;
 * otherwise pose wins over locomotion.
 */
export function resolveAnimationClipKey(
  pose: SoldierActionId | null,
  locomotion: LocomotionState,
): SoldierActionId | LocomotionState {
  if (pose === 'kneel') {
    if (locomotion === 'run' || locomotion === 'runBackward') {
      return 'run';
    }
    if (locomotion !== 'idle') {
      return 'crouchWalking';
    }
  }
  return pose ?? locomotion;
}
