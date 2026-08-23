import type { Group } from 'three';
import type { SoldierId } from '@/modules/soldiers';
import { useGLTF } from '@react-three/drei';

import { useThree } from '@react-three/fiber';
import { useLayoutEffect, useMemo, useRef } from 'react';

import { getSoldierById } from '@/modules/soldiers/get-soldier-by-id';
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
  const model = useMemo(() => {
    const clone = gltf.scene.clone(true);
    prepareFpsViewModel(clone);
    clone.scale.setScalar(definition.scale);
    clone.traverse((child) => {
      child.frustumCulled = false;
    });
    return clone;
  }, [definition.scale, gltf]);

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
