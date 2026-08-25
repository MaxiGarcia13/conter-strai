import type { HitboxPart, HitboxPresetId } from '../types';
import { useMemo } from 'react';
import { DoubleSide } from 'three';
import { hitboxPresets } from '../hitbox-preset-registry';

interface HitboxMeshProps {
  hitboxPresetId: HitboxPresetId;
  entityId: string;
}

function HitboxPartMesh({
  part,
  entityId,
}: {
  part: HitboxPart;
  entityId: string;
}) {
  const userData = useMemo(
    () => ({ hitZone: part.zone, entityId }),
    [part.zone, entityId],
  );

  if (part.kind === 'sphere') {
    return (
      <mesh position={part.offset} userData={userData} visible={false}>
        <sphereGeometry args={[part.radius, 8, 6]} />
        <meshBasicMaterial side={DoubleSide} />
      </mesh>
    );
  }

  return (
    <mesh position={part.offset} userData={userData} visible={false}>
      <boxGeometry args={part.size} />
      <meshBasicMaterial side={DoubleSide} />
    </mesh>
  );
}

/**
 * Invisible collider mesh for a hitbox preset. Each part is tagged with
 * `userData.hitZone` and `userData.entityId` so raycasts can resolve hits.
 */
export function HitboxMesh({ hitboxPresetId, entityId }: HitboxMeshProps) {
  const preset = hitboxPresets[hitboxPresetId];

  return (
    <group>
      {preset.parts.map((part) => (
        <HitboxPartMesh key={part.zone} part={part} entityId={entityId} />
      ))}
    </group>
  );
}
