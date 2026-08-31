import { afterEach, describe, expect, it } from 'vitest';
import { MOVE_CODES } from '@/modules/game/constants/game-bindings';
import {
  clearTouchMoveIntent,
  getPlayerFrameIntent,
  setTouchMoveIntent,
  setTouchRunning,
} from '@/modules/game/input/player-input-intent';

describe('getPlayerFrameIntent', () => {
  afterEach(() => {
    clearTouchMoveIntent();
  });

  it('maps WASD the same as keyboard-only axes', () => {
    expect(getPlayerFrameIntent(new Set([MOVE_CODES.forward]))).toEqual({
      strafe: 0,
      forward: 1,
      running: false,
    });
    expect(getPlayerFrameIntent(new Set([MOVE_CODES.back]))).toEqual({
      strafe: 0,
      forward: -1,
      running: false,
    });
    expect(getPlayerFrameIntent(new Set([MOVE_CODES.left]))).toEqual({
      strafe: -1,
      forward: 0,
      running: false,
    });
    expect(getPlayerFrameIntent(new Set([MOVE_CODES.right]))).toEqual({
      strafe: 1,
      forward: 0,
      running: false,
    });
  });

  it('sprints with Space only while moving', () => {
    expect(getPlayerFrameIntent(new Set([MOVE_CODES.runModifier]))).toEqual({
      strafe: 0,
      forward: 0,
      running: false,
    });
    expect(getPlayerFrameIntent(new Set([MOVE_CODES.forward, MOVE_CODES.runModifier]))).toEqual({
      strafe: 0,
      forward: 1,
      running: true,
    });
  });

  it('lets keyboard win per axis; untouched axes still take touch', () => {
    setTouchMoveIntent(1, -1);
    setTouchRunning(true);
    expect(getPlayerFrameIntent(new Set([MOVE_CODES.forward]))).toEqual({
      strafe: 1,
      forward: 1,
      running: true,
    });
  });

  it('uses touch axes when the keyboard is idle', () => {
    setTouchMoveIntent(-1, 1);
    setTouchRunning(true);
    expect(getPlayerFrameIntent(new Set())).toEqual({
      strafe: -1,
      forward: 1,
      running: true,
    });
  });
});
