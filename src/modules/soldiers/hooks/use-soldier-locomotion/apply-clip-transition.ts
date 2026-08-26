import type { AnimationMixer } from 'three';
import type { ClipKey, SoldierActions } from './types';
import { playDyingHard } from './soldier-actions';

export const CROSSFADE_SECONDS = 0.2;

/**
 * Switch from one clip key to another. Returns whether the transition entered
 * `hitReaction` so callers can acknowledge / notify without store coupling here.
 */
export function applyClipTransition(
  mixer: AnimationMixer,
  actions: SoldierActions,
  fromKey: ClipKey,
  toKey: ClipKey,
  crossfadeSeconds: number = CROSSFADE_SECONDS,
): boolean {
  if (toKey === 'dying') {
    playDyingHard(mixer, actions);
    return false;
  }

  const from = actions[fromKey];
  const to = actions[toKey];
  if (!to) {
    return false;
  }

  to.reset().setEffectiveWeight(1).play();
  if (from) {
    from.crossFadeTo(to, crossfadeSeconds, false);
  }
  return toKey === 'hitReaction';
}
