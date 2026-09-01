/** Exponential follow rate (higher = snappier). Tuned for ~20 Hz network targets. */
const REMOTE_FOLLOW_RATE = 7;
/** Snap instead of easing when the target jumps farther than this (spawn / teleport). */
export const REMOTE_SNAP_DISTANCE = 4;

export interface RemoteRenderTransform {
  x: number;
  z: number;
  rotY: number;
}

/**
 * Frame-rate-independent ease toward a networked transform. Yaw takes the
 * shortest arc so turns never spin the long way.
 */
export function stepRemoteRenderTransform(
  current: RemoteRenderTransform | null,
  target: RemoteRenderTransform,
  deltaSeconds: number,
  followRate: number = REMOTE_FOLLOW_RATE,
): RemoteRenderTransform {
  if (!current) {
    return { ...target };
  }

  const distance = Math.hypot(target.x - current.x, target.z - current.z);
  if (distance > REMOTE_SNAP_DISTANCE || deltaSeconds <= 0) {
    return { ...target };
  }

  const t = 1 - Math.exp(-followRate * deltaSeconds);
  return {
    x: current.x + (target.x - current.x) * t,
    z: current.z + (target.z - current.z) * t,
    rotY: current.rotY + shortestAngleDelta(current.rotY, target.rotY) * t,
  };
}

function shortestAngleDelta(from: number, to: number): number {
  let delta = to - from;
  while (delta > Math.PI) {
    delta -= Math.PI * 2;
  }
  while (delta < -Math.PI) {
    delta += Math.PI * 2;
  }
  return delta;
}
