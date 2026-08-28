import type { LocomotionState, SoldierActionId } from '@/modules/soldiers';

export type LocomotionSoundId = 'walk' | 'run';

/** Maps locomotion (+ blocking poses) to a looping movement SFX, if any. */
export function resolveLocomotionSound(
  locomotion: LocomotionState,
  pose: SoldierActionId | null,
): LocomotionSoundId | null {
  if (pose === 'dying' || pose === 'jump' || pose === 'jumpIdle') {
    return null;
  }

  switch (locomotion) {
    case 'walk':
    case 'crouchWalking':
    case 'walkBackward':
      return 'walk';
    case 'run':
    case 'runBackward':
      return 'run';
    default:
      return null;
  }
}
