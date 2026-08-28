import type { RemotePoseMessage } from './syncable-remote-pose';
import { getPlayerLocomotion, getPlayerPose } from '@/modules/game/state/player-state';
import { getActiveMatch, sendPose } from '@/modules/multiplayer/adapters/colyseus-adapter';
import { TRANSFORM_SYNC_INTERVAL_MS } from '@/modules/multiplayer/adapters/colyseus-adapter/types';
import { isStickyRemoteOneShot, toRemoteClipMessage } from './syncable-remote-pose';

let lastSent: RemotePoseMessage | null = null;
let lastFlushMs = 0;

/**
 * Relays the clip the local mixer is playing. No-op outside a match.
 * Locomotion is throttled to the transform rate (~20 Hz); jump / reload flush
 * immediately. One-shot retrigger sends even when the last message was the same
 * clip so a second jump is not dropped after the sender already cleared locally.
 */
export function flushLocalClipSync(options?: { retriggerOneShot?: boolean }): void {
  if (!getActiveMatch()) {
    lastSent = null;
    lastFlushMs = 0;
    return;
  }

  const immediate = options?.retriggerOneShot === true;
  const now = performance.now();
  if (!immediate && now - lastFlushMs < TRANSFORM_SYNC_INTERVAL_MS) {
    return;
  }

  const message = toRemoteClipMessage(getPlayerPose(), getPlayerLocomotion());
  const retrigger = options?.retriggerOneShot && isStickyRemoteOneShot(message);
  if (message === lastSent && !retrigger) {
    return;
  }

  lastSent = message;
  lastFlushMs = now;
  sendPose(message);
}
