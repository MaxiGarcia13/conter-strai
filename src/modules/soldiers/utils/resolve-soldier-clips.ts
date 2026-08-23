import type { AnimationClip } from 'three';
import type { SoldierAnimationClips } from '../types';

import { stripHipsTranslation } from './strip-root-motion';

export interface ResolvedSoldierClips {
  idle: AnimationClip;
  walk: AnimationClip;
  run: AnimationClip;
}

/** Resolves registry clip names and strips hips root motion for in-place playback. */
export function resolveSoldierClips(
  clips: AnimationClip[],
  config: SoldierAnimationClips,
): ResolvedSoldierClips | null {
  if (clips.length === 0) {
    return null;
  }

  const byName = new Map(clips.map((clip) => [clip.name, clip]));
  const idleSource = byName.get(config.idle);
  const walkSource = byName.get(config.walk);
  const runSource = byName.get(config.run);

  if (!idleSource || !walkSource || !runSource) {
    return null;
  }

  return {
    idle: stripHipsTranslation(idleSource),
    walk: stripHipsTranslation(walkSource),
    run: stripHipsTranslation(runSource),
  };
}
