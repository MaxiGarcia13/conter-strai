import type { Group } from 'three';
import type { SoldierSkinId } from '../types';
import { useGLTF } from '@react-three/drei';
import { useEffect, useMemo, useRef } from 'react';

import { getSoldierSkinById } from '../get-soldier-skin-by-id';
import { disableSkinnedMeshCulling, getSoldierArmature, soldierScaleVector } from '../utils/clone-soldier-root';
import { useSoldierAnimationClips } from './use-soldier-animation-clips';

/** Shared GLTF load → armature → scale → culling pipeline for soldier meshes. */
export function useSoldierMesh(skinId: SoldierSkinId) {
  const modelRef = useRef<Group>(null);
  const skin = useMemo(() => getSoldierSkinById(skinId), [skinId]);
  const gltf = useGLTF(skin.meshData.modelUrl);
  const animations = useSoldierAnimationClips(skin.meshData, gltf.animations);
  const source = useMemo(() => getSoldierArmature(gltf.scene), [gltf]);
  const scale = useMemo(
    () => soldierScaleVector(source, skin.meshData.scale),
    [skin.meshData.scale, source],
  );

  useEffect(() => {
    const model = modelRef.current;
    if (model) {
      disableSkinnedMeshCulling(model);
    }
  }, [source]);

  return { modelRef, source, scale, skin, animations };
}
