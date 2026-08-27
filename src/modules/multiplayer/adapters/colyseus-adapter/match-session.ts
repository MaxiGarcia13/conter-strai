import type {
  LeaveListener,
  PlayerUpdateListener,
  RoundUpdateListener,
  ShotPayload,
  TransformSyncPayload,
} from './types';
import { getActiveMatch, requireActiveMatch, setActiveMatch } from './active-match';

/** Throttled local transform sync (~20 Hz). */
export function syncTransform(transform: TransformSyncPayload): void {
  requireActiveMatch().syncTransform(transform);
}

export function sendShot(shot: ShotPayload): void {
  requireActiveMatch().sendShot(shot);
}

/** Host-only: request the server start the round (`waiting` → `in_progress`). */
export function startMatch(): void {
  requireActiveMatch().startRound();
}

export function onPlayerUpdate(listener: PlayerUpdateListener): () => void {
  return requireActiveMatch().onPlayerUpdate(listener);
}

export function onRoundUpdate(listener: RoundUpdateListener): () => void {
  return requireActiveMatch().onRoundUpdate(listener);
}

export function onLeave(listener: LeaveListener): () => void {
  return requireActiveMatch().onLeave(listener);
}

export async function leaveMatch(): Promise<void> {
  const match = getActiveMatch();
  if (match) {
    await match.leave();
    setActiveMatch(null);
  }
}
