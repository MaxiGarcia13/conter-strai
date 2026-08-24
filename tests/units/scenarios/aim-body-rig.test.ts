import { Bone, MathUtils, Object3D, Quaternion, Vector3 } from 'three';
import { describe, expect, it } from 'vitest';

import {
  applySoldierAimPose,
  resolveSoldierAimRig,
  SPINE_PITCH_WEIGHTS,
} from '@/modules/soldiers/utils/aim-body-rig';

const PITCH_AXIS = new Vector3(1, 0, 0);

function addBone(parent: Object3D, name: string): Bone {
  const bone = new Bone();
  bone.name = name;
  parent.add(bone);
  return bone;
}

interface ArmatureBones {
  root: Object3D;
  head: Bone;
  spine: Bone[];
  leftArm: Bone;
}

function buildArmature(withColon: boolean): ArmatureBones {
  const prefix = withColon ? 'mixamorig:' : 'mixamorig';
  const root = new Object3D();
  root.name = 'Armature';

  const hips = addBone(root, `${prefix}Hips`);
  const spine = [
    addBone(hips, `${prefix}Spine`),
    addBone(hips, `${prefix}Spine1`),
    addBone(hips, `${prefix}Spine2`),
  ];
  const neck = addBone(hips, `${prefix}Neck`);
  addBone(neck, `${prefix}Neck1`);
  const head = addBone(neck, `${prefix}Head`);
  addBone(head, `${prefix}HeadTop_End`);
  const leftArm = addBone(spine[2]!, `${prefix}LeftArm`);

  return { root, head, spine, leftArm };
}

describe('resolveSoldierAimRig', () => {
  it('resolves head and spine chain using the asset’s colon bone names', () => {
    const bones = buildArmature(true);
    const rig = resolveSoldierAimRig(bones.root);

    expect(rig?.head).toBe(bones.head);
    expect(rig?.pitchedBones.map(({ bone }) => bone)).toEqual(bones.spine);
    // Neck is never hidden — scaling it would collapse the head anchor position.
    expect(rig?.hiddenBones.map(({ bone }) => bone)).toEqual([bones.head]);
    expect(rig?.hiddenBones[0]?.restScale.toArray()).toEqual([1, 1, 1]);
  });

  it('resolves colon-less Mixamo aliases as well', () => {
    const bones = buildArmature(false);
    const rig = resolveSoldierAimRig(bones.root);

    expect(rig?.head).toBe(bones.head);
    expect(rig?.pitchedBones.map(({ bone }) => bone)).toEqual(bones.spine);
  });

  it('returns null when the clone has no head bone', () => {
    const root = new Object3D();
    addBone(root, 'mixamorig:Hips');

    expect(resolveSoldierAimRig(root)).toBeNull();
  });
});

describe('applySoldierAimPose', () => {
  it('hides the head and pitches the spine with look while FPS is active', () => {
    const bones = buildArmature(true);
    const rig = resolveSoldierAimRig(bones.root)!;

    applySoldierAimPose(rig, 0.5, true);

    expect(bones.head.scale.x).toBe(0);

    rig.pitchedBones.forEach(({ bone }, index) => {
      const weight = SPINE_PITCH_WEIGHTS[index]!; // all three present → sum is 1
      const expected = new Quaternion().setFromAxisAngle(PITCH_AXIS, -0.5 * weight);
      expect(bone.quaternion.angleTo(expected)).toBeLessThan(1e-6);
    });
  });

  it('keeps pitching the spine in shoulder modes so the arms follow the mouse there too', () => {
    const bones = buildArmature(true);
    const rig = resolveSoldierAimRig(bones.root)!;

    applySoldierAimPose(rig, 0.5, false);

    expect(bones.head.scale.x).toBe(1); // head stays visible…
    rig.pitchedBones.forEach(({ bone }, index) => {
      const weight = SPINE_PITCH_WEIGHTS[index]!;
      const expected = new Quaternion().setFromAxisAngle(PITCH_AXIS, -0.5 * weight);
      expect(bone.quaternion.angleTo(expected)).toBeLessThan(1e-6); // …but the body still aims
    });
  });

  it('applies only the pitch delta while the mixer keeps the frozen pose (clamped kneel)', () => {
    const bones = buildArmature(true);
    const rig = resolveSoldierAimRig(bones.root)!;

    // Held look pitch across many frames: full-pitch-per-frame would spin forever.
    for (let frame = 0; frame < 10; frame++) {
      applySoldierAimPose(rig, 0.5, true);
    }

    rig.pitchedBones.forEach(({ bone }, index) => {
      const weight = SPINE_PITCH_WEIGHTS[index]!;
      const expected = new Quaternion().setFromAxisAngle(PITCH_AXIS, -0.5 * weight);
      expect(bone.quaternion.angleTo(expected)).toBeLessThan(1e-6);
    });
  });

  it('re-applies the full pitch when the mixer refreshed the clip pose', () => {
    const bones = buildArmature(true);
    const rig = resolveSoldierAimRig(bones.root)!;

    applySoldierAimPose(rig, 0.5, true);

    // Simulate the mixer rewriting the spine tracks on the next update.
    for (const bone of bones.spine) {
      bone.quaternion.identity();
    }

    applySoldierAimPose(rig, 0.5, true);

    rig.pitchedBones.forEach(({ bone }, index) => {
      const weight = SPINE_PITCH_WEIGHTS[index]!;
      const expected = new Quaternion().setFromAxisAngle(PITCH_AXIS, -0.5 * weight);
      expect(bone.quaternion.angleTo(expected)).toBeLessThan(1e-6);
    });
  });

  it('keeps the pitch base continuous across a camera-mode switch (no double bend)', () => {
    const bones = buildArmature(true);
    const rig = resolveSoldierAimRig(bones.root)!;

    applySoldierAimPose(rig, 0.5, true);
    applySoldierAimPose(rig, 0.5, false); // switch to shoulder mode at the same pitch

    rig.pitchedBones.forEach(({ bone }, index) => {
      const weight = SPINE_PITCH_WEIGHTS[index]!;
      const expected = new Quaternion().setFromAxisAngle(PITCH_AXIS, -0.5 * weight);
      expect(bone.quaternion.angleTo(expected)).toBeLessThan(1e-6);
    });

    // Frozen bones + raised pitch → exactly the small delta, not the full pitch again.
    applySoldierAimPose(rig, 0.7, false);

    rig.pitchedBones.forEach(({ bone }, index) => {
      const weight = SPINE_PITCH_WEIGHTS[index]!;
      const expected = new Quaternion().setFromAxisAngle(PITCH_AXIS, -0.7 * weight);
      expect(bone.quaternion.angleTo(expected)).toBeLessThan(1e-6);
    });
  });

  it('leaves non-rig bones untouched', () => {
    const bones = buildArmature(false);
    const rig = resolveSoldierAimRig(bones.root)!;
    const armQuaternion = bones.leftArm.quaternion.clone();

    applySoldierAimPose(rig, 0.5, true);

    expect(bones.leftArm.scale.toArray()).toEqual([1, 1, 1]);
    expect(bones.leftArm.quaternion.angleTo(armQuaternion)).toBeLessThan(1e-6);
  });

  it('restores hidden bones from rest scale when inactive', () => {
    const bones = buildArmature(true);
    bones.head.scale.set(0.5, 0.5, 0.5); // non-1 rest captured at resolve time
    const rig = resolveSoldierAimRig(bones.root)!;

    applySoldierAimPose(rig, 0.5, true);
    expect(bones.head.scale.x).toBe(0);

    applySoldierAimPose(rig, 0.5, false);
    // The mixer caches mixed values and never overwrites external mutations,
    // so the pose helper must restore the scale itself.
    expect(bones.head.scale.toArray()).toEqual([0.5, 0.5, 0.5]);
  });

  it('redistributes pitch weights when a spine bone is missing', () => {
    const root = new Object3D();
    root.name = 'Armature';
    const hips = addBone(root, 'mixamorig:Hips');
    const spineOnly = addBone(hips, 'mixamorig:Spine');
    const head = addBone(hips, 'mixamorig:Head');
    const rig = {
      head,
      hiddenBones: [{ bone: head, restScale: head.scale.clone() }],
      pitchedBones: [{ bone: spineOnly, lastWritten: new Quaternion() }],
      appliedPitchRadians: 0,
    };

    applySoldierAimPose(rig, MathUtils.degToRad(90), true);

    const expected = new Quaternion().setFromAxisAngle(PITCH_AXIS, -Math.PI / 2);
    expect(spineOnly.quaternion.angleTo(expected)).toBeLessThan(1e-6);
  });
});
