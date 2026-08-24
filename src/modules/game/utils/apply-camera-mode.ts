import type { Camera } from 'three';
import type { PlayerTransform } from '../state/player-state';
import type { CameraMode } from '../types';
import { PLAYER_EYE_HEIGHT } from '../constants/player';

/** Floor clearance so steep upward look cannot push shoulder cameras underground. */
const MIN_CAMERA_HEIGHT = 0.25;

/** First-person rig — meters behind the player's eyes. */
const FPS_CAMERA_DISTANCE = -0.25;

/** Over-the-shoulder rig — close behind the right shoulder (meters). */
const OTS_CAMERA_DISTANCE = 1.75;
const OTS_CAMERA_HEIGHT = 1.55;
const OTS_SHOULDER_OFFSET = 0.42;

/** Standard third-person rig — tracked behind and above (meters). */
const TPS_CAMERA_DISTANCE = 3.6;
const TPS_CAMERA_HEIGHT = 2.4;

/**
 * Positions the camera for the active mode from the shared player transform.
 * Called every frame — pure placement, no state writes.
 */
export function applyCameraMode(camera: Camera, mode: CameraMode, transform: PlayerTransform): void {
  switch (mode) {
    case 'fps':
      placeShoulderCamera(camera, transform, {
        distance: FPS_CAMERA_DISTANCE,
        height: PLAYER_EYE_HEIGHT,
        shoulderOffset: 0,
      });
      break;
    case 'ots':
      placeShoulderCamera(camera, transform, {
        distance: OTS_CAMERA_DISTANCE,
        height: OTS_CAMERA_HEIGHT,
        shoulderOffset: OTS_SHOULDER_OFFSET,
      });
      break;
    case 'tps':
      placeShoulderCamera(camera, transform, {
        distance: TPS_CAMERA_DISTANCE,
        height: TPS_CAMERA_HEIGHT,
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
