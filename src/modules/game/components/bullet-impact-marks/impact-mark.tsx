import type { BulletImpact } from '@/modules/game/stores/bullet-impact-store';
import { Quaternion, Vector3 } from 'three';

/** Meters the disc nudges off the surface to prevent z-fighting. */
export const IMPACT_OFFSET_METERS = 0.01;
/** Disc radius in meters. */
export const IMPACT_RADIUS_METERS = 0.035;

const DISC_FORWARD = new Vector3(0, 0, 1);

interface ImpactMarkProps {
  impact: BulletImpact;
}

/** Small black disc hugging the hit surface, tilted to its normal. */
export function ImpactMark({ impact }: ImpactMarkProps) {
  const point = impact.point;
  const [nx, ny, nz] = impact.normal;

  return (
    <mesh
      position={[
        point[0] + nx * IMPACT_OFFSET_METERS,
        point[1] + ny * IMPACT_OFFSET_METERS,
        point[2] + nz * IMPACT_OFFSET_METERS,
      ]}
      quaternion={new Quaternion().setFromUnitVectors(DISC_FORWARD, new Vector3(nx, ny, nz))}
    >
      <circleGeometry args={[IMPACT_RADIUS_METERS, 12]} />
      <meshBasicMaterial
        color="#111"
        polygonOffset
        polygonOffsetFactor={-2}
        polygonOffsetUnits={-2}
      />
    </mesh>
  );
}
