import type { Group } from 'three';
import type { SoldierActionId, SoldierSkinId } from '../types';
import { Clone, useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';

import { useEffect, useMemo, useRef } from 'react';
import { HitboxMesh, useHealthStore } from '@/modules/combat';

import { DYING_DROP_SECONDS, dyingGroundOffsetY } from '../constants/dying';
import { getSoldierSkinById } from '../get-soldier-skin-by-id';
import { useSoldierAnimationClips } from '../hooks/use-soldier-animation-clips';
import { useSoldierLocomotion } from '../hooks/use-soldier-locomotion';
import { disableSkinnedMeshCulling, getSoldierArmature, soldierScaleVector } from '../utils/clone-soldier-root';
import { resolveNpcPose } from '../utils/resolve-soldier-pose';

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
  const rootRef = useRef<Group>(null);
  const modelRef = useRef<Group>(null);
  const entityIdRef = useRef(entityId);
  const dropProgressRef = useRef(0);
  entityIdRef.current = entityId;

  const skin = useMemo(() => getSoldierSkinById(id), [id]);
  const gltf = useGLTF(skin.meshData.modelUrl);
  const animations = useSoldierAnimationClips(skin.meshData, gltf.animations);
  const source = useMemo(() => getSoldierArmature(gltf.scene), [gltf]);
  const scale = useMemo(
    () => soldierScaleVector(source, skin.meshData.scale),
    [skin.meshData.scale, source],
  );

  // Poll health every frame so death does not depend on a React re-render.
  const getPoseRef = useRef<() => SoldierActionId | null>(() => null);
  getPoseRef.current = () => {
    const id = entityIdRef.current;
    if (!id) {
      return null;
    }
    const hp = useHealthStore.getState().healthById[id];
    return resolveNpcPose(id, hp?.isEliminated ?? false);
  };

  useSoldierLocomotion(modelRef, animations, skin.meshData.animations, {
    enabled: animated,
    entityId,
    getPose: () => getPoseRef.current(),
  });

  useEffect(() => {
    const model = modelRef.current;
    if (model) {
      // Aim-marker raycasts run pre-matrix-update and would cache a degenerate bound.
      disableSkinnedMeshCulling(model);
    }
  }, [source]);

  // In-clip dying has no hips fall (root motion stripped); ease the root onto the floor.
  useFrame((_, delta) => {
    const root = rootRef.current;
    if (!root) {
      return;
    }

    const dying = getPoseRef.current() === 'dying';
    if (dying) {
      dropProgressRef.current = Math.min(1, dropProgressRef.current + delta / DYING_DROP_SECONDS);
      setTimeout(() => {
        root.position.set(
          position[0],
          position[1] + dyingGroundOffsetY(dropProgressRef.current),
          position[2],
        );
      }, 1000);
    } else {
      dropProgressRef.current = 0;
    }
  });

  return (
    <group
      ref={rootRef}
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
