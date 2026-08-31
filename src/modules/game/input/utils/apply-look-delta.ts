import { LOOK_PITCH_FLOOR, MOUSE_SENSITIVITY, PITCH_LIMIT } from '@/modules/game/constants/player';
import { getPlayerTransform } from '@/modules/game/stores/player-state';
import { clamp } from '@/utils/clamp';

/** Apply a pointer delta to the local player's look (yaw/pitch) with shared sensitivity and pitch limits. */
export function applyLookDelta(deltaX: number, deltaY: number): void {
  const look = getPlayerTransform();
  look.yaw -= deltaX * MOUSE_SENSITIVITY;

  const pitch = clamp(look.pitch - deltaY * MOUSE_SENSITIVITY, -PITCH_LIMIT, PITCH_LIMIT);
  if (pitch >= LOOK_PITCH_FLOOR) {
    look.pitch = pitch;
  }
}
