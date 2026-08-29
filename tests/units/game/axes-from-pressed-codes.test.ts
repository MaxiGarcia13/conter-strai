import { describe, expect, it } from 'vitest';
import { GAME_BINDINGS, MOVE_CODES } from '@/modules/game/constants/game-bindings';
import { axesFromPressedCodes } from '@/modules/game/utils/axes-from-pressed-codes';

const MOVE_AXIS_CODES = GAME_BINDINGS.move.codes;

describe('axesFromPressedCodes', () => {
  it('returns zeros when nothing is pressed', () => {
    expect(axesFromPressedCodes(new Set(), MOVE_AXIS_CODES)).toEqual({ strafe: 0, forward: 0 });
  });

  it('maps WASD to axes', () => {
    expect(axesFromPressedCodes(new Set([MOVE_CODES.forward]), MOVE_AXIS_CODES)).toEqual({
      strafe: 0,
      forward: 1,
    });
    expect(axesFromPressedCodes(new Set([MOVE_CODES.back]), MOVE_AXIS_CODES)).toEqual({
      strafe: 0,
      forward: -1,
    });
    expect(axesFromPressedCodes(new Set([MOVE_CODES.left]), MOVE_AXIS_CODES)).toEqual({
      strafe: -1,
      forward: 0,
    });
    expect(axesFromPressedCodes(new Set([MOVE_CODES.right]), MOVE_AXIS_CODES)).toEqual({
      strafe: 1,
      forward: 0,
    });
  });

  it('combines diagonal input', () => {
    expect(
      axesFromPressedCodes(new Set([MOVE_CODES.forward, MOVE_CODES.right]), MOVE_AXIS_CODES),
    ).toEqual({
      strafe: 1,
      forward: 1,
    });
  });

  it('cancels opposite keys', () => {
    expect(
      axesFromPressedCodes(new Set([MOVE_CODES.forward, MOVE_CODES.back]), MOVE_AXIS_CODES),
    ).toEqual({
      strafe: 0,
      forward: 0,
    });
  });
});
