import type { Object3D } from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { useLayoutEffect, useMemo, useRef } from 'react';
import { DoubleSide, Raycaster, Vector2, Vector3 } from 'three';
import { ACCENT_COLOR } from '../constants/palette';
import { AIM_MARKER_NAME, pickAimSurface } from '../utils/pick-bullet-hit';

const SCREEN_CENTER = new Vector2(0, 0);
const scratchLook = new Vector3();

/** Pull toward the camera to avoid z-fighting (meters). */
const SURFACE_LIFT = 0.02;

/** Reticle at the first scene hit along the camera look; hidden against the sky. */
export function AimMarker() {
  const markerRef = useRef<Object3D>(null);
  const meshRef = useRef<Object3D>(null);
  const scene = useThree((state) => state.scene);
  const camera = useThree((state) => state.camera);
  const raycaster = useMemo(() => new Raycaster(), []);

  // Imperative only — a JSX `visible={false}` prop would fight useFrame every commit.
  useLayoutEffect(() => {
    const marker = markerRef.current;
    if (marker) {
      marker.visible = false;
    }
  }, []);

  useFrame(() => {
    const marker = markerRef.current;
    const mesh = meshRef.current;
    if (!marker || !mesh) {
      return;
    }

    camera.updateMatrixWorld();
    raycaster.setFromCamera(SCREEN_CENTER, camera);
    const hit = pickAimSurface(raycaster.intersectObject(scene, true), mesh);

    if (!hit) {
      marker.visible = false;
      return;
    }

    camera.getWorldDirection(scratchLook);
    marker.position.copy(hit.point).addScaledVector(scratchLook, -SURFACE_LIFT);
    // Face the camera so the ring stays a circle (surface normals tip it into a C-arc).
    // Fixed world size — perspective makes it larger up close and smaller at range.
    marker.quaternion.copy(camera.quaternion);
    marker.scale.setScalar(1);
    marker.visible = true;
  });

  return (
    <group ref={markerRef} name={AIM_MARKER_NAME}>
      <mesh ref={meshRef} renderOrder={1000} raycast={() => {}}>
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
