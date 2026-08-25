import type { Object3D } from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import { DoubleSide, Raycaster, Vector2, Vector3 } from 'three';
import { ACCENT_COLOR } from '../constants/palette';
import { LOCAL_PLAYER_ROOT_NAME } from '../constants/player';

const SCREEN_CENTER = new Vector2(0, 0);
const scratchLook = new Vector3();

/** Pull toward the camera to avoid z-fighting (meters). */
const SURFACE_LIFT = 0.02;

function hasAncestorNamed(object: Object3D, name: string): boolean {
  let current: Object3D | null = object;
  while (current) {
    if (current.name === name) {
      return true;
    }
    current = current.parent;
  }
  return false;
}

/** Reticle at the first scene hit along the camera look; hidden against the sky. */
export function AimMarker() {
  const markerRef = useRef<Object3D>(null);
  const meshRef = useRef<Object3D>(null);
  const scene = useThree((state) => state.scene);
  const camera = useThree((state) => state.camera);
  const raycaster = useMemo(() => new Raycaster(), []);

  useFrame(() => {
    const marker = markerRef.current;
    const mesh = meshRef.current;
    if (!marker || !mesh) {
      return;
    }

    raycaster.setFromCamera(SCREEN_CENTER, camera);
    const hit = raycaster
      .intersectObject(scene, true)
      .find(
        ({ object }) =>
          object.visible &&
          object !== mesh &&
          !hasAncestorNamed(object, LOCAL_PLAYER_ROOT_NAME),
      );

    if (!hit) {
      marker.visible = false;
      return;
    }

    camera.getWorldDirection(scratchLook);
    marker.position.copy(hit.point).addScaledVector(scratchLook, -SURFACE_LIFT);
    // Face the camera so the ring stays a circle (surface normals tip it into a C-arc).
    marker.quaternion.copy(camera.quaternion);
    marker.visible = true;
  });

  return (
    <group ref={markerRef} visible={false}>
      <mesh ref={meshRef}>
        <ringGeometry args={[0.05, 0.085, 24]} />
        <meshBasicMaterial
          color={ACCENT_COLOR}
          transparent
          opacity={0.9}
          side={DoubleSide}
          depthTest={false}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
