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

  it('maps right offset to strafe 1', () => {
    expect(joystickToAxes(0.5, 0)).toEqual({ strafe: 1, forward: 0 });
  });

  it('maps left offset to strafe -1', () => {
    expect(joystickToAxes(-0.5, 0)).toEqual({ strafe: -1, forward: 0 });
  });

  it('maps up (negative Y) to forward 1', () => {
    expect(joystickToAxes(0, -0.5)).toEqual({ strafe: 0, forward: 1 });
  });

  it('maps down (positive Y) to forward -1', () => {
    expect(joystickToAxes(0, 0.5)).toEqual({ strafe: 0, forward: -1 });
  });

  it('handles diagonal offsets', () => {
    expect(joystickToAxes(0.8, -0.8)).toEqual({ strafe: 1, forward: 1 });
  });

  it('respects a custom dead zone', () => {
    expect(joystickToAxes(0.15, 0, 0.2)).toEqual({ strafe: 0, forward: 0 });
    expect(joystickToAxes(0.25, 0, 0.2)).toEqual({ strafe: 1, forward: 0 });
  });
});
