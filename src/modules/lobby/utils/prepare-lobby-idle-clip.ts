import type { AnimationClip } from 'three';
import { stripHipsTranslation } from '@/modules/soldiers/utils/strip-root-motion';

/**
 * Finds a pack clip by on-disk name and strips Mixamo hips translation.
 * Returns null when the name is missing.
 */
export function prepareLobbyIdleClip(clips: AnimationClip[], clipName: string): AnimationClip | null {
  const source = clips.find((clip) => clip.name === clipName);
  if (!source) {
    return null;
  }

  return stripHipsTranslation(source.clone());
}
