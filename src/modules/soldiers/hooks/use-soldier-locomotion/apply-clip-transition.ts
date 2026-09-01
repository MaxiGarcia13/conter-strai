import type { AnimationMixer } from 'three';
import type { ClipKey, SoldierActions } from './types';
import { playDyingHard } from './soldier-actions';

const CROSSFADE_SECONDS = 0.2;
/** Remote locomotion blends longer so ~20 Hz clip changes do not snap. */
export const REMOTE_LOCOMOTION_CROSSFADE_SECONDS = 0.35;
/** Jump one-shots snap in so the takeoff is not delayed by a locomotion fade. */
export const JUMP_CROSSFADE_SECONDS = 0;

export function resolveCrossfadeSeconds(toKey: ClipKey): number {
  if (toKey === 'jump' || toKey === 'jumpIdle') {
    return JUMP_CROSSFADE_SECONDS;
  }
  return CROSSFADE_SECONDS;
}

/**
 * Switch from one clip key to another. Returns whether the transition entered
 * `hitReaction` so callers can acknowledge / notify without store coupling here.
 */
export function applyClipTransition(
  mixer: AnimationMixer,
  actions: SoldierActions,
  fromKey: ClipKey,
  toKey: ClipKey,
  crossfadeSeconds: number = resolveCrossfadeSeconds(toKey),
): boolean {
  if (toKey === 'dying') {
    playDyingHard(mixer, actions);
    return false;
  }

  const to = actions[toKey];
  if (!to) {
    return false;
  }

  to.reset().setEffectiveWeight(1).play();
  // Same-key retrigger (second jump while the clip is still the active action)
  // must not crossfade an action onto itself — that stalls playback.
  if (fromKey === toKey) {
    return toKey === 'hitReaction';
  }

  const from = actions[fromKey];
  if (from) {
    from.crossFadeTo(to, crossfadeSeconds, false);
  }
  return toKey === 'hitReaction';
}
