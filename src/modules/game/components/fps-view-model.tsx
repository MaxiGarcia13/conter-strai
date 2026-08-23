import type { Group } from 'three';
import type { SoldierId } from '@/modules/soldiers';
import { useGLTF } from '@react-three/drei';

import { useThree } from '@react-three/fiber';
import { useLayoutEffect, useMemo, useRef } from 'react';

import { getSoldierById } from '@/modules/soldiers/get-soldier-by-id';
import { cloneSoldierRoot } from '@/modules/soldiers/utils/clone-soldier-root';
import { prepareFpsViewModel } from '@/modules/soldiers/utils/prepare-fps-view-model';

import { VIEWMODEL_OFFSET, VIEWMODEL_ROTATION_Y } from '../constants/player';

interface FpsViewModelProps {
  soldierId?: SoldierId;
}

/** First-person arms/hands rig parented to the active camera. */
export function FpsViewModel({ soldierId = 'swat-guy' }: FpsViewModelProps) {
  const camera = useThree((state) => state.camera);
  const pivotRef = useRef<Group>(null);
  const definition = useMemo(() => getSoldierById(soldierId), [soldierId]);
  const gltf = useGLTF(definition.modelUrl);
  const viewModelScale = definition.viewModelScale ?? definition.scale;
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
