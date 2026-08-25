import type { Object3D } from 'three';
import { Matrix4, Quaternion, Vector3 } from 'three';

/**
 * Pistol GLB barrel axis (+X) and precomputed grip rotation for mixamorig RightHand.
 *
 * Static rotation for all soldiers. Local FPS aim comes from the skeleton —
 * do not re-apply per-frame camera lock (fights spine aim and spins the mesh).
 */
export const PISTOL_BARREL_AXIS = [1, 0, 0] as const;

/** Magazine / grip bottom in pistol GLB local space. */
export const PISTOL_GRIP_DOWN_AXIS = [0, -1, 0] as const;

/** Euler XYZ radians; barrel forward + magazine down at idle neutral aim on swat-1. */
export const DEFAULT_PISTOL_GRIP_ROTATION: [number, number, number] = [
  -2.914701,
  0.20944,
  -1.64061,
];

export const DEFAULT_PISTOL_GRIP_POSITION: [number, number, number] = [
  0.01,
  0.07,
  0.02,
];

const handWorldQuaternion = new Quaternion();
const upHintInHandSpace = new Vector3();
const attachBasis = new Matrix4();
const scratchForward = new Vector3();
const scratchYAxis = new Vector3();
const scratchZAxis = new Vector3();
const scratchQuaternion = new Quaternion();

/**
 * Maps pistol barrel (+X) to aim direction and keeps slide top (+Y) toward `rollHintWorld`
 * (camera up). World-down roll spins 360° on yaw; camera up stays stable for FPS.
 */
export function resolveBarrelGripQuaternion(
  hand: Object3D,
  aimDirectionWorld: Vector3,
  rollHintWorld: Vector3,
  previousGrip?: Quaternion,
): Quaternion {
  hand.getWorldQuaternion(handWorldQuaternion);

  scratchForward
    .copy(aimDirectionWorld)
    .applyQuaternion(handWorldQuaternion.invert())
    .normalize();

  upHintInHandSpace
    .copy(rollHintWorld)
    .applyQuaternion(handWorldQuaternion.invert())
    .normalize();
  upHintInHandSpace.addScaledVector(scratchForward, -upHintInHandSpace.dot(scratchForward));
  if (upHintInHandSpace.lengthSq() < 1e-8) {
    upHintInHandSpace.set(0, 1, 0).addScaledVector(scratchForward, -scratchForward.y);
  }
  upHintInHandSpace.normalize();

  scratchYAxis.copy(upHintInHandSpace);
  scratchZAxis.crossVectors(scratchForward, scratchYAxis);
  if (scratchZAxis.lengthSq() < 1e-8) {
    scratchZAxis.set(0, 0, 1);
  }
  scratchZAxis.normalize();
  scratchYAxis.crossVectors(scratchZAxis, scratchForward).normalize();
  scratchZAxis.crossVectors(scratchForward, scratchYAxis).normalize();

  attachBasis.makeBasis(scratchForward, scratchYAxis, scratchZAxis);
  scratchQuaternion.setFromRotationMatrix(attachBasis);

  if (previousGrip && scratchQuaternion.dot(previousGrip) < 0) {
    scratchQuaternion.x *= -1;
    scratchQuaternion.y *= -1;
    scratchQuaternion.z *= -1;
    scratchQuaternion.w *= -1;
  }

  return scratchQuaternion.clone();
}

/** World-space barrel direction after applying a hand-local grip quaternion. */
export function barrelDirectionWorld(
  hand: Object3D,
  gripQuaternion: Quaternion,
): Vector3 {
  return new Vector3(...PISTOL_BARREL_AXIS)
    .applyQuaternion(gripQuaternion)
    .transformDirection(hand.matrixWorld)
    .normalize();
}

/** World-space magazine-down direction after applying a hand-local grip quaternion. */
export function gripDownDirectionWorld(
  hand: Object3D,
  gripQuaternion: Quaternion,
): Vector3 {
  return new Vector3(...PISTOL_GRIP_DOWN_AXIS)
    .applyQuaternion(gripQuaternion)
    .transformDirection(hand.matrixWorld)
    .normalize();
}

/** Stable FPS roll reference — camera up in world space. */
export function cameraRollHintWorld(cameraQuaternion: Quaternion): Vector3 {
  return new Vector3(0, 1, 0).applyQuaternion(cameraQuaternion).normalize();
}
