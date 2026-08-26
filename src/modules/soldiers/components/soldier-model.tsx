import type { SoldierActionId, SoldierSkinId } from '../types';

import { useRef } from 'react';
import { useHealthStore } from '@/modules/combat';

import { useSoldierLocomotion } from '../hooks/use-soldier-locomotion';
import { useSoldierMesh } from '../hooks/use-soldier-mesh';
import { resolveNpcPose } from '../utils/resolve-soldier-pose';
import { SoldierMeshBody } from './soldier-mesh-body';

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
  const { modelRef, source, scale, skin, animations } = useSoldierMesh(id);
  const entityIdRef = useRef(entityId);
  entityIdRef.current = entityId;

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

  return (
    <group
      position={position}
      rotation={[0, rotationY, 0]}
      userData={entityId ? { entityId } : undefined}
    >
      <SoldierMeshBody
        modelRef={modelRef}
        source={source}
        scale={scale}
        hitboxPresetId={skin.hitboxPresetId}
        entityId={entityId}
      />
    </group>
  );
}
