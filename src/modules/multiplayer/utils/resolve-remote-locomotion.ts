import type { SyncableRemotePose } from './syncable-remote-pose';
import type { LocomotionState, SoldierActionId } from '@/modules/soldiers';
import { REMOTE_SNAP_DISTANCE } from './step-remote-render-transform';
import {
  isStickyRemoteOneShot,
  isSyncedLocomotionClip,
} from './syncable-remote-pose';

/** Matches transform sync throttle (~20 Hz) — floors speed dt to avoid burst false-runs. */
export const REMOTE_SYNC_INTERVAL_MS = 50;

/** Below this speed (m/s) a remote peer counts as idle. */
export const REMOTE_IDLE_SPEED_MPS = 0.5;
/** Enter run at or above this speed (m/s). */
export const REMOTE_RUN_ENTER_MPS = 6.5;
/** Leave run only after speed drops below this (hysteresis vs enter). */
export const REMOTE_RUN_EXIT_MPS = 5.2;
/** Ignore sub-millimeter jitter between identical sync samples. */
export const REMOTE_POSITION_EPSILON = 0.001;
/**
 * Keep walk/run after the last position change so ~20 Hz sync gaps do not
 * flicker the mixer back to idle every frame.
 */
export const REMOTE_IDLE_HOLD_MS = 180;
/**
 * A peer counts as backpedaling when velocity is mostly opposite their facing
 * (dot of facing × velocity below ~135°).
 */
export const REMOTE_BACKWARD_DOT_THRESHOLD = -0.7;

export interface RemoteMotionSample {
  x: number;
  z: number;
  rotY: number;
  /** Timestamp of the last real position change. */
  movedAt: number;
  locomotion: LocomotionState;
}

/**
 * Infer walk/run/idle (plus backward gaits) from network transforms. Only
 * samples when position actually changes; holds the last moving gait briefly so
 * frame-rate reads between 20 Hz syncs do not thrash the animation mixer.
 * Walk↔run uses hysteresis so noisy 20 Hz deltas do not restart clips every tick.
 * Teleports (round respawn) snap to idle instead of a fake sprint.
 */
export function updateRemoteMotion(
  prev: RemoteMotionSample | null,
  next: { x: number; z: number; rotY: number },
  nowMs: number,
): RemoteMotionSample {
  if (!prev) {
    return { x: next.x, z: next.z, rotY: next.rotY, movedAt: nowMs, locomotion: 'idle' };
  }

  const dx = next.x - prev.x;
  const dz = next.z - prev.z;
  const distance = Math.hypot(dx, dz);
  if (distance > REMOTE_SNAP_DISTANCE) {
    return { x: next.x, z: next.z, rotY: next.rotY, movedAt: nowMs, locomotion: 'idle' };
  }

  if (distance > REMOTE_POSITION_EPSILON) {
    const dtMs = Math.max(nowMs - prev.movedAt, REMOTE_SYNC_INTERVAL_MS);
    const speed = distance / (dtMs / 1000);
    const locomotion = resolveSpeedToLocomotion(
      speed,
      prev.locomotion,
      isBackpedal(dx, dz, next.rotY),
    );
    return { x: next.x, z: next.z, rotY: next.rotY, movedAt: nowMs, locomotion };
  }

  if (prev.locomotion !== 'idle' && nowMs - prev.movedAt < REMOTE_IDLE_HOLD_MS) {
    return prev;
  }

  if (prev.locomotion === 'idle') {
    return prev;
  }

  return { ...prev, locomotion: 'idle' };
}

function isBackpedal(dx: number, dz: number, rotY: number): boolean {
  const distance = Math.hypot(dx, dz);
  if (distance === 0) {
    return false;
  }
  // Facing unit vector for yaw (matches local `advancePlayerTransform`).
  const facingX = -Math.sin(rotY);
  const facingZ = -Math.cos(rotY);
  const dot = (facingX * dx + facingZ * dz) / distance;
  return dot < REMOTE_BACKWARD_DOT_THRESHOLD;
}

function resolveSpeedToLocomotion(
  speed: number,
  previous: LocomotionState,
  backward: boolean,
): LocomotionState {
  if (speed < REMOTE_IDLE_SPEED_MPS) {
    return 'idle';
  }

  if (backward) {
    if (previous === 'runBackward') {
      return speed < REMOTE_RUN_EXIT_MPS ? 'walkBackward' : 'runBackward';
    }
    return speed >= REMOTE_RUN_ENTER_MPS ? 'runBackward' : 'walkBackward';
  }

  if (previous === 'run') {
    return speed < REMOTE_RUN_EXIT_MPS ? 'walk' : 'run';
  }

  return speed >= REMOTE_RUN_ENTER_MPS ? 'run' : 'walk';
}

const KNEEL_ANIMATION_POSES = new Set<SyncableRemotePose>(['kneel', 'reloadingKneel']);

/**
 * Locomotion fed to the remote mixer — caps false run/idle flicker while a
 * peer is kneeling so clip resolve stays on crouch-walk instead of restarting
 * kneel enter or stand-run. There is no crouch-backward clip, so backpedaling
 * while knelt falls back to crouch-walk / run-over-kneel.
 */
export function resolveRemoteLocomotionForAnimation(
  motion: RemoteMotionSample | null,
  syncedPose: SyncableRemotePose | undefined,
  nowMs: number,
): LocomotionState {
  const locomotion = motion?.locomotion ?? 'idle';

  if (!syncedPose || !KNEEL_ANIMATION_POSES.has(syncedPose)) {
    return locomotion;
  }

  if (locomotion === 'run' || locomotion === 'runBackward') {
    return 'walk';
  }

  if (locomotion === 'walkBackward' || locomotion === 'crouchWalking') {
    return 'crouchWalking';
  }

  if (
    locomotion === 'idle'
    && motion
    && nowMs - motion.movedAt < REMOTE_IDLE_HOLD_MS
  ) {
    return 'walk';
  }

  return locomotion;
}

export interface RemotePlaybackInput {
  synced: SyncableRemotePose | undefined;
  poseEpoch: number;
  inferredLocomotion: LocomotionState;
  heldOneShot: SyncableRemotePose | null;
  consumedEpoch: number;
}

export interface RemotePlayback {
  pose: SoldierActionId | null;
  locomotion: LocomotionState;
  heldOneShot: SyncableRemotePose | null;
}

/**
 * Prefer the clip the sender resolved (same `resolveAnimationClipKey` as local)
 * over inferred gaits. One-shots play until the mixer finishes or the sender
 * resumes a locomotion clip — whichever comes first (prevents stuck jumps).
 */
export function resolveRemotePlayback({
  synced,
  poseEpoch,
  inferredLocomotion,
  heldOneShot,
  consumedEpoch,
}: RemotePlaybackInput): RemotePlayback {
  if (isSyncedLocomotionClip(synced)) {
    return { pose: null, locomotion: synced, heldOneShot: null };
  }

  if (synced === 'kneel') {
    return { pose: 'kneel', locomotion: 'idle', heldOneShot: null };
  }

  if (synced && isStickyRemoteOneShot(synced)) {
    if (poseEpoch !== consumedEpoch) {
      return { pose: synced, locomotion: 'idle', heldOneShot: synced };
    }
    return { pose: null, locomotion: inferredLocomotion, heldOneShot: null };
  }

  if (heldOneShot) {
    return { pose: heldOneShot as SoldierActionId, locomotion: 'idle', heldOneShot };
  }

  if (synced === 'clear' || !synced) {
    return { pose: null, locomotion: inferredLocomotion, heldOneShot: null };
  }

  return { pose: synced as SoldierActionId, locomotion: inferredLocomotion, heldOneShot: null };
}
