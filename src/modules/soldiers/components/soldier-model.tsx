import type { Group } from 'three';
import type { SoldierSkinId } from '../types';
import { Clone, useGLTF } from '@react-three/drei';

import { useCallback, useEffect, useMemo, useRef } from 'react';
import { HitboxMesh, useHealthStore } from '@/modules/combat';

import { getSoldierSkinById } from '../get-soldier-skin-by-id';
import { useSoldierAnimationClips } from '../hooks/use-soldier-animation-clips';
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
  id = 'swat-1',
  entityId,
  position = [0, 0, 0],
  rotationY = 0,
  animated = true,
}: SoldierModelProps) {
  const modelRef = useRef<Group>(null);
  const skin = useMemo(() => getSoldierSkinById(id), [id]);
  const gltf = useGLTF(skin.meshData.modelUrl);
  const animations = useSoldierAnimationClips(skin.meshData, gltf.animations);
  const source = useMemo(() => getSoldierArmature(gltf.scene), [gltf]);
  const scale = useMemo(
    () => soldierScaleVector(source, skin.meshData.scale),
    [skin.meshData.scale, source],
  );

  const eliminated = useHealthStore(
    useCallback(
      (s) => (entityId ? s.healthById[entityId]?.isEliminated ?? false : false),
      [entityId],
    ),
  );
  const eliminatedRef = useRef(eliminated);
  eliminatedRef.current = eliminated;

  useSoldierLocomotion(modelRef, animations, skin.meshData.animations, {
    enabled: animated,
    getPose: entityId ? () => (eliminatedRef.current ? 'dying' : null) : undefined,
  });

  useEffect(() => {
    const model = modelRef.current;
    if (model) {
      // Aim-marker raycasts run pre-matrix-update and would cache a degenerate bound.
      disableSkinnedMeshCulling(model);
    }
  }, [source]);

  return (
    <group
      position={position}
      rotation={[0, rotationY, 0]}
      userData={entityId ? { entityId } : undefined}
    >
      <Clone ref={modelRef} object={source} scale={scale} />
      {entityId && (
        <HitboxMesh hitboxPresetId={skin.hitboxPresetId} entityId={entityId} />
      )}
    </group>
  );
}
