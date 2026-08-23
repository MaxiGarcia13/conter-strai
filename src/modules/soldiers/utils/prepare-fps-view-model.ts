import type { Object3D } from 'three';
import { Bone } from 'three';

/** Head/neck bones are scaled to zero so the camera does not clip through the mesh. */
const HIDDEN_BONE_PATTERN = /mixamorig(?:Head|Neck)/;
/** Leg bones are hidden so only arms/hands remain visible in first person. */
const LEG_BONE_PATTERN = /mixamorig(?:Left|Right)(?:UpLeg|Leg|Foot|ToeBase)/;

export function prepareFpsViewModel(root: Object3D): void {
  root.traverse((obj) => {
    if (!(obj instanceof Bone)) {
      return;
    }
    if (HIDDEN_BONE_PATTERN.test(obj.name) || LEG_BONE_PATTERN.test(obj.name)) {
      obj.scale.set(0, 0, 0);
    }
  });
}
