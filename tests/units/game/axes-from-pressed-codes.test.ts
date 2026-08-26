import { describe, expect, it } from 'vitest';
import { axesFromPressedCodes } from '@/modules/game/utils/axes-from-pressed-codes';

const CODES = {
  forward: 'KeyW',
  back: 'KeyS',
  left: 'KeyA',
  right: 'KeyD',
};

describe('axesFromPressedCodes', () => {
  it('returns zeros when nothing is pressed', () => {
    expect(axesFromPressedCodes(new Set(), CODES)).toEqual({ strafe: 0, forward: 0 });
  });

  it('maps WASD to axes', () => {
    expect(axesFromPressedCodes(new Set(['KeyW']), CODES)).toEqual({ strafe: 0, forward: 1 });
    expect(axesFromPressedCodes(new Set(['KeyS']), CODES)).toEqual({ strafe: 0, forward: -1 });
    expect(axesFromPressedCodes(new Set(['KeyA']), CODES)).toEqual({ strafe: -1, forward: 0 });
    expect(axesFromPressedCodes(new Set(['KeyD']), CODES)).toEqual({ strafe: 1, forward: 0 });
  });

  it('combines diagonal input', () => {
    expect(axesFromPressedCodes(new Set(['KeyW', 'KeyD']), CODES)).toEqual({
      strafe: 1,
      forward: 1,
    });
  });

  it('cancels opposite keys', () => {
    expect(axesFromPressedCodes(new Set(['KeyW', 'KeyS']), CODES)).toEqual({
      strafe: 0,
      forward: 0,
    });
  });
});
