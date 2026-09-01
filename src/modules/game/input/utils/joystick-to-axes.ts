const DEFAULT_JOYSTICK_DEAD_ZONE = 0.1;

export interface JoystickAxes {
  strafe: number;
  forward: number;
}

/**
 * Map a joystick offset vector (relative to center, magnitude ≤ 1) to analog
 * movement axes that preserve direction. Offsets within
 * {@link DEFAULT_JOYSTICK_DEAD_ZONE} are treated as neutral; beyond that,
 * magnitude ramps smoothly to full deflection at the stick edge.
 */
export function joystickToAxes(offsetX: number, offsetY: number, deadZone = DEFAULT_JOYSTICK_DEAD_ZONE): JoystickAxes {
  const magnitude = Math.hypot(offsetX, offsetY);

  if (magnitude <= deadZone) {
    return { strafe: 0, forward: 0 };
  }

  const scaledMagnitude = Math.min((magnitude - deadZone) / (1 - deadZone), 1);
  const scale = scaledMagnitude / magnitude;

  const strafe = offsetX === 0 ? 0 : offsetX * scale;
  const forward = offsetY === 0 ? 0 : -offsetY * scale;

  return { strafe, forward };
}
