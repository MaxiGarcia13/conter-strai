import type { Object3D, Vector3 } from 'three';
import { AnimationClip, Box3 } from 'three';

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

const HIPS_BONE_NAMES = ['mixamorigHips', 'mixamorig:Hips'] as const;
const BIND_POSITION = Symbol('bindHipsPosition');

function findHips(root: Object3D): Object3D | null {
  for (const name of HIPS_BONE_NAMES) {
    const bone = root.getObjectByName(name);
    if (bone) {
      return bone;
    }
  }
  return null;
}

/** Stores the rest-pose hips translation on first call. */
export function cacheHipsBindPosition(root: Object3D): void {
  const hips = findHips(root);
  if (hips && !(BIND_POSITION in hips.userData)) {
    hips.userData[BIND_POSITION as unknown as keyof typeof hips.userData] = hips.position.clone();
  }
}

/** Resets hips translation after the mixer so root motion cannot lift the character. */
export function lockHipsBindPosition(root: Object3D): void {
  const hips = findHips(root);
  const bind = hips?.userData[BIND_POSITION as unknown as keyof typeof hips.userData] as Vector3 | undefined;
  if (hips && bind) {
    hips.position.copy(bind);
  }
}

/** World-space Y lift so the lowest vertex sits on the rig origin (ground). */
export function measureFeetGroundOffset(root: Object3D): number {
  root.updateMatrixWorld(true);
  const box = new Box3().setFromObject(root);
  return -box.min.y;
}
