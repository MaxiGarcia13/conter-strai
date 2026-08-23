import type { Object3D } from 'three';
import { SkinnedMesh } from 'three';
import { SkeletonUtils } from 'three-stdlib';

/** Skinned mesh root in swat-soldier.glb (avoids duplicate empty armatures). */
export const SOLDIER_ROOT_NAME = 'Armature';

export function getSoldierArmature(scene: Object3D): Object3D {
  return scene.getObjectByName(SOLDIER_ROOT_NAME) ?? scene;
}

export function soldierScaleVector(source: Object3D, multiplier: number): [number, number, number] {
  const s = source.scale.x * multiplier;
  return [s, s, s];
}

function refreshSkinnedMeshes(root: Object3D): void {
  root.traverse((child) => {
    if (child instanceof SkinnedMesh) {
      child.frustumCulled = false;
      child.skeleton.pose();
      child.skeleton.update();
    }
  });
}

/** Clones the soldier armature and multiplies its existing scale (GLB embeds 0.01 → ~1.7 m). */
export function cloneSoldierRoot(scene: Object3D, scaleMultiplier = 1): Object3D {
  const source = getSoldierArmature(scene);
  const clone = SkeletonUtils.clone(source);
  clone.scale.multiplyScalar(scaleMultiplier);
  refreshSkinnedMeshes(clone);
  return clone;
}
