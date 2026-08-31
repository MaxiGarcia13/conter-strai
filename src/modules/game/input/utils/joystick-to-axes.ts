const DEFAULT_JOYSTICK_DEAD_ZONE = 0.1;

export interface JoystickAxes {
  strafe: -1 | 0 | 1;
  forward: -1 | 0 | 1;
}

/**
 * Map a joystick offset vector (relative to center, magnitude ≤ 1) to discrete
 * movement axes. Offsets within {@link DEFAULT_JOYSTICK_DEAD_ZONE} are treated
 * as neutral to ignore thumb rest / jitter.
 */
export function joystickToAxes(offsetX: number, offsetY: number, deadZone = DEFAULT_JOYSTICK_DEAD_ZONE): JoystickAxes {
  const magnitude = Math.hypot(offsetX, offsetY);

  if (magnitude <= deadZone) {
    return { strafe: 0, forward: 0 };
  }

  const strafe = offsetX === 0 ? 0 : offsetX > 0 ? 1 : -1;
  const forward = offsetY === 0 ? 0 : offsetY > 0 ? -1 : 1;
  return { strafe, forward };
}
