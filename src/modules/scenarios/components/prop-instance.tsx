import type { ScenarioProp } from '../types';
import { useGLTF } from '@react-three/drei';

import { useMemo } from 'react';

import { getPropById } from '@/modules/props';

export function PropInstance({ prop }: { prop: ScenarioProp }) {
  const definition = useMemo(() => getPropById(prop.id), [prop.id]);
  const gltf = useGLTF(definition.modelUrl);
  const model = useMemo(() => gltf.scene.clone(true), [gltf]);
  return (
    <primitive
      object={model}
      position={prop.position}
      rotation={[0, prop.rotationY ?? 0, 0]}
      scale={prop.scale ?? definition.scale ?? 1}
    />
  );
}
