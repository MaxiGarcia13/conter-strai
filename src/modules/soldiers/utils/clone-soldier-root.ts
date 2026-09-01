import type { Object3D } from 'three';
import { SkinnedMesh } from 'three';

/** Skinned mesh root in soldier GLBs (avoids duplicate empty armatures). */
export const SOLDIER_ROOT_NAME = 'Armature';

export function getSoldierArmature(scene: Object3D): Object3D {
  return scene.getObjectByName(SOLDIER_ROOT_NAME) ?? scene;
}

export function soldierScaleVector(source: Object3D, multiplier: number): [number, number, number] {
  const s = source.scale.x * multiplier;
  return [s, s, s];
}

/**
 * Animated skeletons invalidate cached bounding spheres (a pre-pose raycast
 * caches a degenerate one); soldier visibility never relies on them.
 */
export function disableSkinnedMeshCulling(root: Object3D): void {
  root.traverse((child) => {
    if (child instanceof SkinnedMesh) {
      child.frustumCulled = false;
    }
  });
}