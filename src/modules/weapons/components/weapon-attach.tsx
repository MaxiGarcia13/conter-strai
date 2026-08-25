import type { RefObject } from 'react';
import type { Group, Object3D } from 'three';
import { useGLTF } from '@react-three/drei';
import { createPortal, useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useState } from 'react';

import { DEFAULT_WEAPON_ID, weapons } from '../weapon-registry';
import { findRightHandBone } from '../utils/find-right-hand-bone';

/** Mixamo bone translations are in cm; weapon GLBs are authored in meters. */
export const WEAPON_ATTACH_SCALE = 100;

interface WeaponAttachProps {
  modelRef: RefObject<Group | null>;
  /** Bumps when the soldier clone remounts so attach re-resolves the hand bone. */
  attachKey?: string;
  weaponId?: string;
}

function scaleGripPosition(
  gripPosition: [number, number, number] | undefined,
): [number, number, number] | undefined {
  if (!gripPosition) {
    return undefined;
  }
  return gripPosition.map((value) => value * WEAPON_ATTACH_SCALE) as [number, number, number];
}

export function WeaponAttach({
  modelRef,
  attachKey,
  weaponId = DEFAULT_WEAPON_ID,
}: WeaponAttachProps) {
  const weapon = weapons[weaponId] ?? weapons[DEFAULT_WEAPON_ID];
  const gltf = useGLTF(weapon.modelUrl);
  const weaponScene = useMemo(() => gltf.scene.clone(true), [gltf]);
  const attachPosition = useMemo(
    () => scaleGripPosition(weapon.gripPosition),
    [weapon.gripPosition],
  );
  const [handBone, setHandBone] = useState<Object3D | null>(null);

  useEffect(() => {
    setHandBone(null);
  }, [attachKey, weaponId]);

  // Clone ref is assigned after the first commit; retry until the hand bone exists.
  useFrame(() => {
    if (handBone) {
      return;
    }
    const model = modelRef.current;
    if (!model) {
      return;
    }
    const hand = findRightHandBone(model);
    if (hand) {
      setHandBone(hand);
    }
  });

  if (!handBone) {
    return null;
  }

  return createPortal(
    <group position={attachPosition} rotation={weapon.gripRotation}>
      <group scale={WEAPON_ATTACH_SCALE}>
        <primitive object={weaponScene} />
      </group>
    </group>,
    handBone,
  );
}
