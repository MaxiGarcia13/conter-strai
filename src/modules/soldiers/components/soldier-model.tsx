import type { Group } from 'three';
import type { SoldierSkinId } from '../types';
import { Clone, useGLTF } from '@react-three/drei';

import { useEffect, useMemo, useRef } from 'react';

import { HitboxMesh } from '@/modules/combat';

import { getSoldierSkinById } from '../get-soldier-skin-by-id';
import { useSoldierLocomotion } from '../hooks/use-soldier-locomotion';
import { disableSkinnedMeshCulling, getSoldierArmature, soldierScaleVector } from '../utils/clone-soldier-root';

interface SoldierModelProps {
  id?: SoldierSkinId;
  /** Entity id for hitbox tagging; omit to skip hitbox colliders. */
  entityId?: string;
  /** World position in meters; Y is ground level. */
  position?: [number, number, number];
  /** Yaw in radians; 0 faces +Z. */
  rotationY?: number;
  /** Play idle / walk clips from the soldier registry. */
  animated?: boolean;
}

export function SoldierModel({
  id = 'swat-guy',
  entityId,
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

  useEffect(() => {
    const model = modelRef.current;
    if (model) {
      // Aim-marker raycasts run pre-matrix-update and would cache a degenerate bound.
      disableSkinnedMeshCulling(model);
    }
  }, [source]);

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <Clone ref={modelRef} object={source} scale={scale} />
      {entityId && (
        <HitboxMesh hitboxPresetId={skin.hitboxPresetId} entityId={entityId} />
      )}
    </group>
  );
}
