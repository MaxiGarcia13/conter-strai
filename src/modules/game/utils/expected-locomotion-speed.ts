import type { LocomotionState } from '@/modules/soldiers';
import {
  RUN_BACKWARD_SPEED,
  RUN_SPEED,
  WALK_BACKWARD_SPEED,
  WALK_SPEED,
} from '../constants/locomotion';

/** World speed (m/s) for each locomotion state driven by player movement constants. */
export function expectedLocomotionSpeed(locomotion: LocomotionState): number | null {
  switch (locomotion) {
    case 'walk':
    case 'crouchWalking':
      return WALK_SPEED;
    case 'run':
      return RUN_SPEED;
    case 'walkBackward':
      return WALK_BACKWARD_SPEED;
    case 'runBackward':
      return RUN_BACKWARD_SPEED;
    default:
      return null;
  }
}
