import { AnimationClip } from 'three';

/** Mixamo hips translation drives root motion — strip for in-place locomotion. */
function isHipsTranslationTrack(trackName: string): boolean {
  // eslint-disable-next-line regexp/no-unused-capturing-group
  return /mixamorig:?Hips\.(position|translation)$/i.test(trackName);
}

/** Removes hips translation keys so locomotion clips don't teleport the mesh. */
export function stripHipsTranslation(clip: AnimationClip): AnimationClip {
  const tracks = clip.tracks.filter((track) => !isHipsTranslationTrack(track.name));
  if (tracks.length === clip.tracks.length) {
    return clip;
  }
  return new AnimationClip(clip.name, clip.duration, tracks);
}
