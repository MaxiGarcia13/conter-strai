import type { Camera, Object3D } from 'three';
import type { PlayerTransform } from '../stores/player-state';

import { Vector3 } from 'three';

const headPosition = new Vector3();

/**
 * FPS placement from the head bone's world position; look angles stay owned
 * by the shared player transform. Must run after this frame's mixer update
 * (`getWorldPosition` refreshes the ancestor chain) to avoid one-frame lag.
 *
 * `eyeOffsetY` is per-skin (Remy’s head joint sits low relative to the eyes).
 */
export function placeCameraAtHead(
  camera: Camera,
  head: Object3D,
  transform: PlayerTransform,
  eyeOffsetY = 0,
): void {
  head.getWorldPosition(headPosition);
  camera.position.copy(headPosition);
  if (eyeOffsetY !== 0) {
    camera.position.y += eyeOffsetY;
  }
  camera.rotation.set(transform.pitch, transform.yaw, 0);
}
