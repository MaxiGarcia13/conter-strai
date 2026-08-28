import type { LocomotionState, SoldierActionId } from '@/modules/soldiers';
import { resolveAnimationClipKey } from '@/modules/soldiers/utils/resolve-animation-clip-key';

type RemoteClipKey = SoldierActionId | LocomotionState;

/**
 * Client-owned clips relayed to peers — the same `resolveAnimationClipKey`
 * result the local mixer plays. Excludes authority-driven poses (`dying` from
 * schema, `hitReaction` from combat).
 */
export const SYNCABLE_REMOTE_POSES = [
  'jump',
  'jumpIdle',
  'kneel',
  'reloading',
  'reloadingKneel',
  'shooting',
  'crouchWalking',
  'idle',
  'walk',
  'run',
  'walkBackward',
  'runBackward',
] as const satisfies readonly RemoteClipKey[];

export type SyncableRemotePose = (typeof SYNCABLE_REMOTE_POSES)[number];

/** Ephemeral clip relay; `clear` returns the receiver to inferred locomotion. */
export type RemotePoseMessage = SyncableRemotePose | 'clear';

const SYNCABLE_SET = new Set<string>(SYNCABLE_REMOTE_POSES);

/** One-shots that must play to completion on the receiver even if the sender already moved on. */
export const STICKY_REMOTE_ONE_SHOTS = [
  'jump',
  'jumpIdle',
  'reloading',
  'reloadingKneel',
  'shooting',
] as const satisfies readonly SyncableRemotePose[];

const STICKY_SET = new Set<string>(STICKY_REMOTE_ONE_SHOTS);

const LOCOMOTION_CLIPS = new Set<string>([
  'idle',
  'walk',
  'run',
  'crouchWalking',
  'walkBackward',
  'runBackward',
]);

export function isStickyRemoteOneShot(clip: string | undefined): clip is (typeof STICKY_REMOTE_ONE_SHOTS)[number] {
  return !!clip && STICKY_SET.has(clip);
}

export function isSyncedLocomotionClip(clip: string | undefined): clip is LocomotionState {
  return !!clip && LOCOMOTION_CLIPS.has(clip);
}

/** Maps a resolved clip key to the network message peers should play. */
export function toRemotePoseMessage(clip: RemoteClipKey | null): RemotePoseMessage {
  if (clip && SYNCABLE_SET.has(clip)) {
    return clip as SyncableRemotePose;
  }
  return 'clear';
}

/**
 * Same clip the local mixer plays (`resolveAnimationClipKey`), mapped onto the
 * relay. Authority poses (`dying` / `hitReaction`) become `clear`.
 */
export function toRemoteClipMessage(
  pose: SoldierActionId | null,
  locomotion: LocomotionState,
): RemotePoseMessage {
  return toRemotePoseMessage(resolveAnimationClipKey(pose, locomotion));
}

export function isRemotePoseMessage(value: unknown): value is RemotePoseMessage {
  return value === 'clear' || (typeof value === 'string' && SYNCABLE_SET.has(value));
}
