import type { RefObject } from 'react';
import type { Group, Object3D } from 'three';
import type { HitboxPresetId } from '@/modules/combat';
import { Clone } from '@react-three/drei';
import { HitboxMesh } from '@/modules/combat';
import { WeaponAttach } from '@/modules/weapons/components/weapon-attach';

interface SoldierMeshBodyProps {
  modelRef: RefObject<Group | null>;
  source: Object3D;
  scale: [number, number, number];
  hitboxPresetId: HitboxPresetId;
  /** When set, mounts weapon attach + hitbox colliders. */
  entityId?: string;
}

/** Shared Clone + weapon + hitbox subtree; outer group ownership stays with the caller. */
export function SoldierMeshBody({
  modelRef,
  source,
  scale,
  hitboxPresetId,
  entityId,
}: SoldierMeshBodyProps) {
  return (
    <>
      <Clone ref={modelRef} object={source} scale={scale} />
      {entityId && <WeaponAttach attachKey={source.uuid} modelRef={modelRef} />}
      {entityId && <HitboxMesh hitboxPresetId={hitboxPresetId} entityId={entityId} />}
    </>
  );
}
