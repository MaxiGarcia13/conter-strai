import type { LocomotionState } from '@/modules/soldiers';
import { REMOTE_SNAP_DISTANCE } from './step-remote-render-transform';

/** Below this speed (m/s) a remote peer counts as idle. */
export const REMOTE_IDLE_SPEED_MPS = 0.5;
/** Enter run at or above this speed (m/s). */
export const REMOTE_RUN_ENTER_MPS = 6.5;
/** Leave run only after speed drops below this (hysteresis vs enter). */
export const REMOTE_RUN_EXIT_MPS = 5.2;
/** Ignore sub-millimeter jitter between identical sync samples. */
export const REMOTE_POSITION_EPSILON = 0.001;
/**
 * Keep walk/run after the last position change so ~20 Hz sync gaps do not
 * flicker the mixer back to idle every frame.
 */
export const REMOTE_IDLE_HOLD_MS = 180;

export interface RemoteMotionSample {
  x: number;
  z: number;
  /** Timestamp of the last real position change. */
  movedAt: number;
  locomotion: LocomotionState;
}

/**
 * Infer walk/run/idle from network transforms. Only samples when position
 * actually changes; holds the last moving gait briefly so frame-rate reads
 * between 20 Hz syncs do not thrash the animation mixer. Walk↔run uses
 * hysteresis so noisy 20 Hz deltas do not restart clips every tick.
 * Teleports (round respawn) snap to idle instead of a fake sprint.
 */
export function updateRemoteMotion(
  prev: RemoteMotionSample | null,
  next: { x: number; z: number },
  nowMs: number,
): RemoteMotionSample {
  if (!prev) {
    return { x: next.x, z: next.z, movedAt: nowMs, locomotion: 'idle' };
  }

  const distance = Math.hypot(next.x - prev.x, next.z - prev.z);
  if (distance > REMOTE_SNAP_DISTANCE) {
    return { x: next.x, z: next.z, movedAt: nowMs, locomotion: 'idle' };
  }

  if (distance > REMOTE_POSITION_EPSILON) {
    const dtMs = Math.max(nowMs - prev.movedAt, 1);
    const speed = distance / (dtMs / 1000);
    const locomotion = resolveSpeedToLocomotion(speed, prev.locomotion);
    return { x: next.x, z: next.z, movedAt: nowMs, locomotion };
  }

  if (prev.locomotion !== 'idle' && nowMs - prev.movedAt < REMOTE_IDLE_HOLD_MS) {
    return prev;
  }

  if (prev.locomotion === 'idle') {
    return prev;
  }

  return { ...prev, locomotion: 'idle' };
}

function resolveSpeedToLocomotion(
  speed: number,
  previous: LocomotionState,
): LocomotionState {
  if (speed < REMOTE_IDLE_SPEED_MPS) {
    return 'idle';
  }

  if (previous === 'run') {
    return speed < REMOTE_RUN_EXIT_MPS ? 'walk' : 'run';
  }

  return speed >= REMOTE_RUN_ENTER_MPS ? 'run' : 'walk';
}
