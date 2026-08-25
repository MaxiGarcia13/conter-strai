import type { AnimationClip } from 'three';
import type { SoldierAnimationClips } from '../types';

import { stripHipsTranslation } from './strip-root-motion';

export interface ResolvedSoldierClips {
  idle: AnimationClip;
  walk: AnimationClip;
  run: AnimationClip;
  crouchWalking: AnimationClip;
  jump: AnimationClip;
  kneel: AnimationClip;
  dying: AnimationClip;
  reloading?: AnimationClip;
  shooting?: AnimationClip;
  hitReaction?: AnimationClip;
}

const CLIP_KEYS = [
  'idle',
  'walk',
  'run',
  'crouchWalking',
  'jump',
  'kneel',
  'dying',
] as const;

const OPTIONAL_KEYS = ['reloading', 'shooting', 'hitReaction'] as const;

// In-place playback: strip horizontal root motion from locomotion clips only.
const STRIP_HIPS_KEYS: readonly (keyof ResolvedSoldierClips)[] = [
  'idle',
  'walk',
  'run',
  'crouchWalking',
];

/** Resolves registry clip names; selected clips get hips root motion stripped. */
export function resolveSoldierClips(
  clips: AnimationClip[],
  config: SoldierAnimationClips,
): ResolvedSoldierClips | null {
  if (clips.length === 0) {
    return null;
  }

  const byName = new Map(clips.map((clip) => [clip.name, clip]));
  const resolved = {} as ResolvedSoldierClips;

  for (const key of CLIP_KEYS) {
    const source = byName.get(config[key]);
    if (!source) {
      return null;
    }
    resolved[key] = STRIP_HIPS_KEYS.includes(key) ? stripHipsTranslation(source) : source;
  }

  for (const key of OPTIONAL_KEYS) {
    const clipName = config[key];
    if (clipName) {
      const source = byName.get(clipName);
      if (source) {
        resolved[key] = source;
      }
    }
  }

  return resolved;
}
