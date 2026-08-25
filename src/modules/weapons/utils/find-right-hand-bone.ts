import type { Object3D } from 'three';

export const RIGHT_HAND_BONE_NAMES = ['mixamorigRightHand', 'mixamorig:RightHand'] as const;

/** Resolves the Mixamo right-hand bone on a soldier clone (either name spelling). */
export function findRightHandBone(root: Object3D): Object3D | null {
  for (const name of RIGHT_HAND_BONE_NAMES) {
    const bone = root.getObjectByName(name);
    if (bone) {
      return bone;
    }
  }
  return null;
}
