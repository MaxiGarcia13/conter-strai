import type { PlayerFrameIntent } from './types';
import type { WasdCodeMap } from '@/modules/game/utils/axes-from-pressed-codes';
import { MOVE_CODES } from '@/modules/game/constants/game-bindings';
import { axesFromPressedCodes } from '@/modules/game/utils/axes-from-pressed-codes';

type MoveCodeMap = WasdCodeMap & { runModifier: string };

interface TouchMoveIntent {
  strafe: number;
  forward: number;
  running: boolean;
}

const touchIntent: TouchMoveIntent = {
  strafe: 0,
  forward: 0,
  running: false,
};

/** Set the current touch-provider move axes (from the virtual joystick). */
export function setTouchMoveIntent(strafe: number, forward: number): void {
  touchIntent.strafe = strafe;
  touchIntent.forward = forward;
}

/** Clear the touch move intent — hands the frame back to keyboard-only input. */
export function clearTouchMoveIntent(): void {
  touchIntent.strafe = 0;
  touchIntent.forward = 0;
  touchIntent.running = false;
}

/** Set whether the touch provider wants to sprint (run button held). */
export function setTouchRunning(running: boolean): void {
  touchIntent.running = running;
}

/**
 * Merged per-frame movement intent: keyboard axes (from the pressed-code set)
 * take precedence where nonzero, otherwise touch axes apply. Running is true
 * when either provider requests it.
 */
export function getPlayerFrameIntent(
  pressed: Set<string>,
  codes: MoveCodeMap = MOVE_CODES,
): PlayerFrameIntent {
  const keyboardAxes = axesFromPressedCodes(pressed, codes);

  const strafe = keyboardAxes.strafe !== 0 ? keyboardAxes.strafe : touchIntent.strafe;
  const forward = keyboardAxes.forward !== 0 ? keyboardAxes.forward : touchIntent.forward;

  const moving = strafe !== 0 || forward !== 0;
  const running = moving && (pressed.has(codes.runModifier) || touchIntent.running);

  return {
    strafe: strafe as -1 | 0 | 1,
    forward: forward as -1 | 0 | 1,
    running,
  };
}
