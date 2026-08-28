import type { MoveMessage } from '../adapters/colyseus-adapter/types';
import { RUN_SPEED } from '@/modules/game/constants/player';
import { TRANSFORM_SYNC_INTERVAL_MS } from '../adapters/colyseus-adapter/types';

/** Hard per-message horizontal teleport cap (meters). */
export const MOVE_MAX_DELTA_METERS = 8;

/** Headroom above `RUN_SPEED` for network jitter / hitched-frame gaps. */
export const MOVE_SPEED_TOLERANCE = 1.75;

/** Treat near-zero message gaps as at least one sync window to avoid false drops. */
const MIN_SPAN_MS = TRANSFORM_SYNC_INTERVAL_MS;

export interface TrackedPosition {
  x: number;
  z: number;
  atMs: number;
}

export interface MoveCandidate {
  x: number;
  z: number;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

/** Runtime shape guard for the `move` wire message. */
export function isMoveMessage(value: unknown): value is MoveMessage {
  if (value === null || typeof value !== 'object') {
    return false;
  }
  const message = value as Partial<MoveMessage>;
  return (
    isFiniteNumber(message.x)
    && isFiniteNumber(message.y)
    && isFiniteNumber(message.z)
    && isFiniteNumber(message.rotY)
  );
}

/** True when the candidate exceeds the allowed speed/time delta from the last accepted move. */
export function moveExceedsThreshold(
  previous: TrackedPosition,
  candidate: MoveCandidate,
  nowMs: number,
): boolean {
  const spanMs = Math.max(nowMs - previous.atMs, MIN_SPAN_MS);
  const maxDelta = Math.min(
    RUN_SPEED * (spanMs / 1000) * MOVE_SPEED_TOLERANCE,
    MOVE_MAX_DELTA_METERS,
  );
  return Math.hypot(candidate.x - previous.x, candidate.z - previous.z) > maxDelta;
}
