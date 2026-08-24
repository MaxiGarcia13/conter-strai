import type { LocomotionState } from '../types';

interface ResolveLocomotionStateProps {
  moving: boolean;
  running: boolean;
}

/**
 * Converts raw input intent into the canonical locomotion state.
 * Standing still => idle, moving on foot => walk, moving with run modifier => run.
 */
export function resolveLocomotionState({ moving, running }: ResolveLocomotionStateProps): LocomotionState {
  if (!moving) {
    return 'idle';
  }

  return running ? 'run' : 'walk';
}
