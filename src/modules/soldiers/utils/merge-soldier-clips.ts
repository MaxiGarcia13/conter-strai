import type { AnimationClip } from 'three';

/**
 * Merges mesh-local and shared-pack clips. Shared wins on name collision so
 * `base-animations.glb` is the source of truth for locomotion / action names.
 */
export function mergeSoldierClips(
  meshClips: AnimationClip[],
  sharedClips: AnimationClip[],
): AnimationClip[] {
  const byName = new Map<string, AnimationClip>();
  for (const clip of meshClips) {
    byName.set(clip.name, clip);
  }
  for (const clip of sharedClips) {
    byName.set(clip.name, clip);
  }
  return [...byName.values()];
}
