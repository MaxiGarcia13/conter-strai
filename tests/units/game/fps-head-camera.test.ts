import { Bone, Object3D, PerspectiveCamera } from 'three';
import { describe, expect, it } from 'vitest';

import { placeCameraAtHead } from '@/modules/game/utils/fps-head-camera';

describe('placeCameraAtHead', () => {
  it('places the camera on the head bone by default', () => {
    const camera = new PerspectiveCamera();
    const head = new Bone();
    head.position.set(1, 1.6, 2);
    const root = new Object3D();
    root.add(head);
    root.updateMatrixWorld(true);

    placeCameraAtHead(camera, head, { x: 0, z: 0, yaw: 0, pitch: 0 });

    expect(camera.position.x).toBeCloseTo(1, 5);
    expect(camera.position.y).toBeCloseTo(1.6, 5);
    expect(camera.position.z).toBeCloseTo(2, 5);
  });

  it('applies a per-skin eyeOffsetY nudge', () => {
    const camera = new PerspectiveCamera();
    const head = new Bone();
    head.position.set(1, 1.6, 2);
    const root = new Object3D();
    root.add(head);
    root.updateMatrixWorld(true);

    placeCameraAtHead(camera, head, { x: 0, z: 0, yaw: 0, pitch: 0 }, 0.1);

    expect(camera.position.y).toBeCloseTo(1.7, 5);
  });
});
