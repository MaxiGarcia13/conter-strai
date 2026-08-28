import type { LocomotionState } from '../types';

interface ResolveLocomotionStateProps {
  moving: boolean;
  running: boolean;
  /** Dominant backpedal (forward < 0 and |forward| >= |strafe|). */
  backward?: boolean;
}

/**
 * Converts raw input intent into the canonical locomotion state.
 * Standing still => idle, moving on foot => walk, moving with run modifier => run,
 * dominant backpedal => walk-backward / run-backward.
 */
export function resolveLocomotionState({ moving, running, backward }: ResolveLocomotionStateProps): LocomotionState {
  if (!moving) {
    return 'idle';
  }

  if (running) {
    return backward ? 'runBackward' : 'run';
  }

  return backward ? 'walkBackward' : 'walk';
}
