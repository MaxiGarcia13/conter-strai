import { Group, PerspectiveCamera, Vector3 } from 'three';
import { describe, expect, it } from 'vitest';

import {
  barrelDirectionWorld,
  cameraRollHintWorld,
  gripDownDirectionWorld,
  resolveBarrelGripQuaternion,
} from '@/modules/weapons/utils/pistol-grip-alignment';

describe('resolveBarrelGripQuaternion', () => {
  it('maps barrel +X to the aim direction in hand space', () => {
    const hand = new Group();
    hand.rotation.set(0, Math.PI / 4, 0);
    hand.updateMatrixWorld(true);

    const aimDirection = new Vector3(0, 0, -1);
    const grip = resolveBarrelGripQuaternion(hand, aimDirection, new Vector3(0, 1, 0));

    expect(barrelDirectionWorld(hand, grip).dot(aimDirection)).toBeGreaterThan(0.999);
  });

  it('keeps the slide top (+Y) toward the roll hint', () => {
    const hand = new Group();
    hand.rotation.set(0, Math.PI / 4, 0);
    hand.updateMatrixWorld(true);

    const aimDirection = new Vector3(0, 0, -1);
    const rollHint = new Vector3(0, 1, 0);
    const grip = resolveBarrelGripQuaternion(hand, aimDirection, rollHint);
    const pistolUp = new Vector3(0, 1, 0)
      .applyQuaternion(grip)
      .transformDirection(hand.matrixWorld)
      .normalize();

    expect(pistolUp.dot(rollHint)).toBeGreaterThan(0.9);
    expect(gripDownDirectionWorld(hand, grip).y).toBeLessThan(0);
  });

  it('tracks a pitched camera forward vector', () => {
    const hand = new Group();
    hand.rotation.set(0.2, -0.5, 0.1);
    hand.updateMatrixWorld(true);

    const camera = new PerspectiveCamera();
    camera.rotation.set(-0.35, 0.8, 0);
    camera.updateMatrixWorld(true);

    const aimDirection = new Vector3();
    camera.getWorldDirection(aimDirection);
    const rollHint = cameraRollHintWorld(camera.quaternion);

    const grip = resolveBarrelGripQuaternion(hand, aimDirection, rollHint);

    expect(barrelDirectionWorld(hand, grip).dot(aimDirection)).toBeGreaterThan(0.999);
    expect(gripDownDirectionWorld(hand, grip).y).toBeLessThan(0);
  });
});
