import type {
  LeaveListener,
  PlayerUpdateListener,
  PoseListener,
  RemotePoseMessage,
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

/** Relay a cosmetic local pose to peers (jump / kneel / clear). */
export function sendPose(pose: RemotePoseMessage): void {
  requireActiveMatch().sendPose(pose);
}

/** Host-only: start or restart the round (`waiting` | `ended` → `countdown` → `in_progress`). */
export function startMatch(): void {
  requireActiveMatch().startRound();
}

export function onPose(listener: PoseListener): () => void {
  return requireActiveMatch().onPose(listener);
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
