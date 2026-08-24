import type { Camera } from 'three';
import type { PlayerTransform } from '../state/player-state';
import type { CameraMode } from '../types';
import { PLAYER_EYE_HEIGHT } from '../constants/player';

/** Floor clearance so steep upward look cannot push shoulder cameras underground. */
const MIN_CAMERA_HEIGHT = 0.25;

/**
 * Positions the camera for the active mode from the shared player transform.
 * Called every frame — pure placement, no state writes.
 */
export function applyCameraMode(camera: Camera, mode: CameraMode, transform: PlayerTransform): void {
  switch (mode) {
    case 'fps':
      placeShoulderCamera(camera, transform, {
        distance: -0.25,
        height: PLAYER_EYE_HEIGHT - 0.1,
        shoulderOffset: 0,
      });
      break;
    case 'ots':
      placeShoulderCamera(camera, transform, {
        distance: 0.75,
        height: 2,
        shoulderOffset: 0,
      });
      break;
    case 'tps':
      placeShoulderCamera(camera, transform, {
        distance: 1.25,
        height: 2.2,
        shoulderOffset: 0,
      });
      break;
  }
}

interface ShoulderRig {
  /** Meters back along the look direction (shrinks as pitch rises). */
  distance: number;
  /** Neutral camera height at level look (meters). */
  height: number;
  /** Lateral shift toward the right shoulder (meters). */
  shoulderOffset: number;
}

function placeShoulderCamera(
  camera: Camera,
  transform: PlayerTransform,
  rig: ShoulderRig,
): void {
  const cosPitch = Math.cos(transform.pitch);
  // Look direction on the yaw/pitch sphere; camera sits opposite it behind the pivot.
  const dirX = -Math.sin(transform.yaw) * cosPitch;
  const dirZ = -Math.cos(transform.yaw) * cosPitch;
  const dirY = Math.sin(transform.pitch);
  const rightX = Math.cos(transform.yaw);
  const rightZ = -Math.sin(transform.yaw);

  camera.position.set(
    transform.x - dirX * rig.distance + rightX * rig.shoulderOffset,
    Math.max(rig.height - dirY * rig.distance, MIN_CAMERA_HEIGHT),
    transform.z - dirZ * rig.distance + rightZ * rig.shoulderOffset,
  );
  camera.rotation.set(transform.pitch, transform.yaw, 0);
}
