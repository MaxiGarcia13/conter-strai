import { describe, expect, it } from 'vitest';
import { joystickToAxes } from '@/modules/game/input/utils/joystick-to-axes';

describe('joystickToAxes', () => {
  it('returns neutral when offset is zero', () => {
    expect(joystickToAxes(0, 0)).toEqual({ strafe: 0, forward: 0 });
  });

  it('returns neutral inside the default dead zone', () => {
    expect(joystickToAxes(0.05, 0.05)).toEqual({ strafe: 0, forward: 0 });
  });

  it('returns neutral exactly on the dead zone boundary', () => {
    expect(joystickToAxes(0.1, 0)).toEqual({ strafe: 0, forward: 0 });
  });

  it('maps right offset to positive strafe', () => {
    const axes = joystickToAxes(0.5, 0);
    expect(axes.strafe).toBeCloseTo(0.444, 2);
    expect(axes.forward).toBe(0);
  });

  it('maps left offset to negative strafe', () => {
    const axes = joystickToAxes(-0.5, 0);
    expect(axes.strafe).toBeCloseTo(-0.444, 2);
    expect(axes.forward).toBe(0);
  });

  it('maps up (negative Y) to positive forward', () => {
    const axes = joystickToAxes(0, -0.5);
    expect(axes.strafe).toBe(0);
    expect(axes.forward).toBeCloseTo(0.444, 2);
  });

  it('maps down (positive Y) to negative forward', () => {
    const axes = joystickToAxes(0, 0.5);
    expect(axes.strafe).toBe(0);
    expect(axes.forward).toBeCloseTo(-0.444, 2);
  });

  it('preserves diagonal direction instead of snapping each axis', () => {
    const axes = joystickToAxes(0.8, -0.8);
    expect(axes.strafe).toBeCloseTo(0.707, 2);
    expect(axes.forward).toBeCloseTo(0.707, 2);
  });

  it('reaches full deflection at the stick edge', () => {
    expect(joystickToAxes(1, 0)).toEqual({ strafe: 1, forward: 0 });
    expect(joystickToAxes(0, -1)).toEqual({ strafe: 0, forward: 1 });
  });

  it('respects a custom dead zone', () => {
    expect(joystickToAxes(0.15, 0, 0.2)).toEqual({ strafe: 0, forward: 0 });
    const axes = joystickToAxes(0.25, 0, 0.2);
    expect(axes.strafe).toBeCloseTo(0.0625, 4);
    expect(axes.forward).toBe(0);
  });
});
