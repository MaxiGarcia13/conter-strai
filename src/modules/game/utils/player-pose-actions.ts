import {
  bumpPlayerPoseEpoch,
  getPlayerLocomotion,
  getPlayerPose,
  setPlayerPose,
} from '@/modules/game/stores/player-state';
import { flushLocalClipSync } from '@/modules/multiplayer/utils/sync-local-clip';
import { scheduleReloadGunSound, stopReloadGunSound } from './reload-gun-sound';

function applyPoseAndSync(
  next: ReturnType<typeof getPlayerPose>,
  options?: { retriggerOneShot?: boolean },
): void {
  setPlayerPose(next);
  if (options?.retriggerOneShot) {
    bumpPlayerPoseEpoch();
  }
  flushLocalClipSync(options);
}

function resolveJumpPose(): 'jump' | 'jumpIdle' {
  return getPlayerLocomotion() === 'idle' ? 'jumpIdle' : 'jump';
}

export function requestJump(): void {
  const pose = getPlayerPose();
  const jumpPose = resolveJumpPose();
  if (pose === 'reloading' || pose === 'reloadingKneel' || pose === 'dying') {
    return;
  }
  // Busy until the mixer finishes; LocalPlayer clears the pose on completion.
  if (pose === 'kneel' || pose === null) {
    applyPoseAndSync(jumpPose, { retriggerOneShot: true });
  }
}

export function toggleKneel(): void {
  const pose = getPlayerPose();
  if (pose === 'kneel') {
    applyPoseAndSync(null);
    return;
  }
  if (pose === null) {
    applyPoseAndSync('kneel');
  }
}

export function requestReload(): void {
  const pose = getPlayerPose();
  if (pose === null && getPlayerLocomotion() === 'idle') {
    applyPoseAndSync('reloading', { retriggerOneShot: true });
    scheduleReloadGunSound();
  } else if (pose === 'kneel') {
    applyPoseAndSync('reloadingKneel', { retriggerOneShot: true });
    scheduleReloadGunSound();
  }
}

export function cancelReload(): void {
  const pose = getPlayerPose();
  if (pose === 'reloading') {
    stopReloadGunSound();
    applyPoseAndSync(null);
  } else if (pose === 'reloadingKneel') {
    stopReloadGunSound();
    applyPoseAndSync('kneel');
  }
}
