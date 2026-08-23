import type { Group } from 'three';
import type { SoldierSkinId } from '../types';
import { Clone, useGLTF } from '@react-three/drei';

import { useMemo, useRef } from 'react';

import { getSoldierSkinById } from '../get-soldier-skin-by-id';
import { useSoldierLocomotion } from '../hooks/use-soldier-locomotion';
import { getSoldierArmature, soldierScaleVector } from '../utils/clone-soldier-root';

interface SoldierModelProps {
  id?: SoldierSkinId;
  /** World position in meters; Y is ground level. */
  position?: [number, number, number];
  /** Yaw in radians; 0 faces +Z. */
  rotationY?: number;
  /** Play idle / walk clips from the soldier registry. */
  animated?: boolean;
}

export function SoldierModel({
  id = 'swat-guy',
  position = [0, 0, 0],
  rotationY = 0,
  animated = true,
}: SoldierModelProps) {
  const modelRef = useRef<Group>(null);
  const skin = useMemo(() => getSoldierSkinById(id), [id]);
  const gltf = useGLTF(skin.meshData.modelUrl);
  const animations = useMemo(() => gltf.animations, [gltf]);
  const source = useMemo(() => getSoldierArmature(gltf.scene), [gltf]);
  const scale = useMemo(
    () => soldierScaleVector(source, skin.meshData.scale),
    [skin.meshData.scale, source],
  );

  useSoldierLocomotion(modelRef, animations, skin.meshData.animations, {
    enabled: animated,
  });

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <Clone ref={modelRef} object={source} scale={scale} />
    </group>
  );
}
