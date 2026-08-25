import type { Object3D } from 'three';
import { Quaternion, Vector3 } from 'three';

/**
 * Soldier GLB bone contract (Mixamo export): names appear with and
 * without the `:` separator, so every lookup tries both spellings.
 */
const HEAD_BONE_NAMES = ['mixamorigHead', 'mixamorig:Head'] as const;

const SPINE_BONE_SUFFIXES = ['Spine', 'Spine1', 'Spine2'] as const;

/** Look-pitch share per spine bone (root → up); sums to 1 for full follow. */
export const SPINE_PITCH_WEIGHTS: readonly number[] = [0.25, 0.35, 0.4];

interface HiddenBone {
  bone: Object3D;
  /** Scale captured before any hiding; the restore target outside FPS. */
  restScale: Vector3;
}

interface PitchedBone {
  bone: Object3D;
  /** Last quaternion this helper wrote; detects whether the mixer rewrote the bone. */
  lastWritten: Quaternion;
}

export interface SoldierAimRig {
  /** Camera anchor; kept unscaled so its world position survives the hide. */
  head: Object3D;
  /** Bones scaled to zero while FPS is active, restored when it is not. */
  hiddenBones: HiddenBone[];
  /** Upper-body bones receiving look pitch, root → up. */
  pitchedBones: PitchedBone[];
  /** Look pitch currently baked into the pitched bones. */
  appliedPitchRadians: number;
}

function findBone(root: Object3D, names: readonly string[]): Object3D | null {
  for (const name of names) {
    const bone = root.getObjectByName(name);
    if (bone) {
      return bone;
    }
  }
  return null;
}

/** Resolves the aim rig on a soldier clone; `null` when no head bone exists. */
export function resolveSoldierAimRig(root: Object3D): SoldierAimRig | null {
  const head = findBone(root, HEAD_BONE_NAMES);
  if (!head) {
    return null;
  }

  const pitchedBones: PitchedBone[] = [];
  for (const suffix of SPINE_BONE_SUFFIXES) {
    const bone = findBone(root, [`mixamorig${suffix}`, `mixamorig:${suffix}`]);
    if (bone) {
      pitchedBones.push({ bone, lastWritten: new Quaternion() });
    }
  }

  // Neck stays visible: scaling it would collapse the head anchor onto the neck base.
  const hiddenBones = [{ bone: head, restScale: head.scale.clone() }];
  return { head, hiddenBones, pitchedBones, appliedPitchRadians: 0 };
}

const PITCH_AXIS = new Vector3(1, 0, 0);
const ZERO_SCALE = new Vector3(0, 0, 0);
const scratchQuaternion = new Quaternion();

/**
 * Per-frame local-body pose, applied AFTER the mixer update in every camera
 * mode: look pitch always bends the spine so the arms track the mouse; only
 * the head hide follows the FPS flag.
 *
 * The mixer never overwrites externally mutated bone properties once they have
 * been touched (cached PropertyMixer values), but it DOES rewrite them while a
 * playing clip drives the track. So per bone: if the quaternion changed since
 * our last write the mixer refreshed it and we apply the full look pitch;
 * otherwise (frozen clip, e.g. clamped kneel) only the pitch delta since the
 * previous frame — applying full pitch there would spin the body every frame.
 */
export function applySoldierAimPose(rig: SoldierAimRig, pitchRadians: number, hideHead: boolean): void {
  for (const { bone, restScale } of rig.hiddenBones) {
    bone.scale.copy(hideHead ? ZERO_SCALE : restScale);
  }

  const pitchedBones = rig.pitchedBones;
  if (pitchedBones.length === 0) {
    rig.appliedPitchRadians = pitchRadians;
    return;
  }

  // Mixer-refreshed bones carry the un-pitched clip pose; frozen ones still hold our bend.
  const activeWeights = SPINE_PITCH_WEIGHTS.slice(0, pitchedBones.length);
  const weightSum = activeWeights.reduce((sum, weight) => sum + weight, 0);

  for (const [index, pitched] of pitchedBones.entries()) {
    const { bone, lastWritten } = pitched;
    const mixerRefreshed = !bone.quaternion.equals(lastWritten);
    const delta = mixerRefreshed ? pitchRadians : pitchRadians - rig.appliedPitchRadians;
    const appliedPitch = delta * (activeWeights[index]! / weightSum);

    scratchQuaternion.setFromAxisAngle(PITCH_AXIS, -appliedPitch);
    bone.quaternion.premultiply(scratchQuaternion);
    lastWritten.copy(bone.quaternion);
  }
  rig.appliedPitchRadians = pitchRadians;
}
