import {
  getPlayerLocomotion,
  getPlayerPose,
  setPlayerPose,
} from '@/modules/game/state/player-state';

export function requestJump(): void {
  const pose = getPlayerPose();
  // If kneeling, clear kneel first; next frame will pick up the jump.
  if (pose === 'kneel') {
    setPlayerPose(null);
    return;
  }
  // Busy until the mixer finishes; LocalPlayer clears the pose on completion.
  if (pose === null) {
    setPlayerPose('jump');
  }
}

export function toggleKneel(): void {
  const pose = getPlayerPose();
  if (pose === 'kneel') {
    setPlayerPose(null);
    return;
  }
  if (pose === null) {
    setPlayerPose('kneel');
  }
}

export function requestReload(): void {
  const pose = getPlayerPose();
  if (pose === null && getPlayerLocomotion() === 'idle') {
    setPlayerPose('reloading');
  } else if (pose === 'kneel') {
    setPlayerPose('reloadingKneel');
  }
}

export function cancelReload(): void {
  const pose = getPlayerPose();
  if (pose === 'reloading') {
    setPlayerPose(null);
  } else if (pose === 'reloadingKneel') {
    setPlayerPose('kneel');
  }
}
