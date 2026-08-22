import type { SoldierId } from '../types';
import { useGLTF } from '@react-three/drei';

import { useMemo } from 'react';

import { getSoldierById } from '../get-soldier-by-id';

interface SoldierModelProps {
  id?: SoldierId;
  /** World position in meters; Y is ground level. */
  position?: [number, number, number];
  /** Yaw in radians; 0 faces +Z. */
  rotationY?: number;
}

export function SoldierModel({ id = 'swat-guy', position = [0, 0, 0], rotationY = 0 }: SoldierModelProps) {
  const definition = useMemo(() => getSoldierById(id), [id]);
  const gltf = useGLTF(definition.modelUrl);
  const model = useMemo(() => gltf.scene.clone(true), [gltf]);
  return (
    <primitive
      object={model}
      position={position}
      rotation={[0, rotationY, 0]}
      scale={definition.scale}
    />
  );
}
