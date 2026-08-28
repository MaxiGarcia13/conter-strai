import type { SoldierActionId } from '@/modules/soldiers';

/**
 * Client-owned cosmetic poses relayed to peers. Excludes authority-driven poses
 * (`dying` from schema, `hitReaction` from combat) and locomotion composites
 * (`crouchWalking` is inferred from kneel + movement on the receiver).
 */
export const SYNCABLE_REMOTE_POSES = [
  'jump',
  'kneel',
  'reloading',
  'reloadingKneel',
  'shooting',
] as const satisfies readonly SoldierActionId[];

export type SyncableRemotePose = (typeof SYNCABLE_REMOTE_POSES)[number];

/** Ephemeral pose relay; `clear` returns the receiver to inferred locomotion. */
export type RemotePoseMessage = SyncableRemotePose | 'clear';

const SYNCABLE_SET = new Set<string>(SYNCABLE_REMOTE_POSES);

/** Maps local player pose to the network message peers should play. */
export function toRemotePoseMessage(pose: SoldierActionId | null): RemotePoseMessage {
  if (pose && SYNCABLE_SET.has(pose)) {
    return pose as SyncableRemotePose;
  }
  return 'clear';
}

export function isRemotePoseMessage(value: unknown): value is RemotePoseMessage {
  return value === 'clear' || (typeof value === 'string' && SYNCABLE_SET.has(value));
}
