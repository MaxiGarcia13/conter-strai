import type { Group } from 'three';
import type { SoldierSkinId } from '@/modules/soldiers';
import { useGLTF } from '@react-three/drei';

import { useThree } from '@react-three/fiber';
import { useLayoutEffect, useMemo, useRef } from 'react';

import { getSoldierSkinById } from '@/modules/soldiers';
import { cloneSoldierRoot } from '@/modules/soldiers/utils/clone-soldier-root';
import { prepareFpsViewModel } from '@/modules/soldiers/utils/prepare-fps-view-model';

import { VIEWMODEL_OFFSET, VIEWMODEL_ROTATION_Y } from '../constants/player';

interface FpsViewModelProps {
  skinId?: SoldierSkinId;
}

/** First-person arms/hands rig parented to the active camera. */
export function FpsViewModel({ skinId = 'swat-guy' }: FpsViewModelProps) {
  const camera = useThree((state) => state.camera);
  const pivotRef = useRef<Group>(null);
  const skin = useMemo(() => getSoldierSkinById(skinId), [skinId]);
  const gltf = useGLTF(skin.meshData.modelUrl);
  const viewModelScale = skin.meshData.viewModelScale ?? skin.meshData.scale;
  const model = useMemo(() => {
    const clone = cloneSoldierRoot(gltf.scene, viewModelScale);
    prepareFpsViewModel(clone);
    clone.traverse((child) => {
      child.frustumCulled = false;
    });
    return clone;
  }, [gltf, viewModelScale]);

  useLayoutEffect(() => {
    const pivot = pivotRef.current;
    if (!pivot) {
      return;
    }
    camera.add(pivot);
    return () => {
      camera.remove(pivot);
    };
  }, [camera]);

  return (
    <group ref={pivotRef} position={VIEWMODEL_OFFSET} rotation={[0, VIEWMODEL_ROTATION_Y, 0]}>
      <primitive object={model} />
    </group>
  );
}
