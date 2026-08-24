import type { Camera, Object3D } from 'three';
import type { PlayerTransform } from '../state/player-state';

import { Vector3 } from 'three';

const headPosition = new Vector3();

/**
 * FPS placement from the head bone's world position; look angles stay owned
 * by the shared player transform. Must run after this frame's mixer update
 * (`getWorldPosition` refreshes the ancestor chain) to avoid one-frame lag.
 */
export function placeCameraAtHead(
  camera: Camera,
  head: Object3D,
  transform: PlayerTransform,
): void {
  head.getWorldPosition(headPosition);
  camera.position.copy(headPosition);
  camera.rotation.set(transform.pitch, transform.yaw, 0);
}
