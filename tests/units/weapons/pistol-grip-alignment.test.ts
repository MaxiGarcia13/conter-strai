import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { AnimationMixer, Euler, Group, PerspectiveCamera, Quaternion, Vector3 } from 'three';
import type { Object3D } from 'three';
import { SkeletonUtils } from 'three-stdlib';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { beforeAll, describe, expect, it } from 'vitest';

import { applySoldierAimPose, resolveSoldierAimRig } from '@/modules/soldiers/utils/aim-body-rig';
import {
  DEFAULT_PISTOL_GRIP_ROTATION,
  PISTOL_BARREL_AXIS,
  gripDownDirectionWorld,
} from '@/modules/weapons/utils/pistol-grip-alignment';
import { DEFAULT_WEAPON_ID, weapons } from '@/modules/weapons/weapon-registry';

const ROOT = resolve(import.meta.dirname, '../../..');

function parseGltf(loader: GLTFLoader, relativePath: string): Promise<GLTF> {
  const absolutePath = resolve(ROOT, relativePath);
  const buffer = readFileSync(absolutePath);
  return new Promise((res, rej) => {
    loader.parse(buffer.buffer, absolutePath, res, rej);
  });
}

describe('pistol grip alignment', () => {
  let barrelAtNeutralAim: Vector3;
  let cameraForward: Vector3;
  let magazineDownAtNeutralAim: Vector3;
  let hand: Object3D;

  beforeAll(async () => {
    globalThis.self = { URL } as typeof globalThis & { URL: typeof URL };

    const loader = new GLTFLoader();
    const [character, animations] = await Promise.all([
      parseGltf(loader, 'public/assets/characters/soldiers/swat-1.glb'),
      parseGltf(loader, 'public/assets/characters/shared/base-animations.glb'),
    ]);

    const source = character.scene.getObjectByName('Armature');
    if (!source) {
      throw new Error('Armature missing from swat-1.glb');
    }

    const clone = SkeletonUtils.clone(source);
    clone.scale.multiplyScalar(0.01);

    const rigGroup = new Group();
    rigGroup.rotation.y = Math.PI;
    rigGroup.add(clone);

    const handBone = clone.getObjectByName('mixamorigRightHand');
    if (!handBone) {
      throw new Error('mixamorigRightHand missing from swat-1.glb');
    }
    hand = handBone;

    const aimRig = resolveSoldierAimRig(clone);
    if (!aimRig) {
      throw new Error('aim rig missing from swat-1 clone');
    }

    const idleClip = animations.animations.find((clip) => clip.name === 'idle');
    if (!idleClip) {
      throw new Error('idle clip missing from base-animations.glb');
    }

    const mixer = new AnimationMixer(clone);
    mixer.clipAction(idleClip).play();
    mixer.update(0);
    applySoldierAimPose(aimRig, 0, true);
    rigGroup.updateMatrixWorld(true);

    const camera = new PerspectiveCamera();
    aimRig.head.getWorldPosition(camera.position);
    camera.rotation.set(0, 0, 0);
    camera.updateMatrixWorld(true);

    cameraForward = new Vector3();
    camera.getWorldDirection(cameraForward);

    const gripQuaternion = new Quaternion().setFromEuler(
      new Euler(...DEFAULT_PISTOL_GRIP_ROTATION, 'XYZ'),
    );
    barrelAtNeutralAim = new Vector3(...PISTOL_BARREL_AXIS)
      .applyQuaternion(gripQuaternion)
      .transformDirection(hand.matrixWorld)
      .normalize();
    magazineDownAtNeutralAim = gripDownDirectionWorld(hand, gripQuaternion);
  });

  it('registry uses the precomputed pistol grip rotation', () => {
    expect(weapons[DEFAULT_WEAPON_ID].gripRotation).toEqual(DEFAULT_PISTOL_GRIP_ROTATION);
  });

  it('barrel points at the crosshair ray at neutral aim', () => {
    const alignment = barrelAtNeutralAim.dot(cameraForward);
    expect(alignment).toBeGreaterThan(0.999);
    expect(Math.abs(barrelAtNeutralAim.x)).toBeLessThan(0.02);
  });

  it('magazine bottom points toward world down at neutral aim', () => {
    expect(magazineDownAtNeutralAim.y).toBeLessThan(-0.9);
  });
});
