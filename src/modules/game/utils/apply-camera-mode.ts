import type { Camera } from 'three';
import type { PlayerTransform } from '../stores/player-state';
import type { CameraMode } from '../types';
import { DEFAULT_BODY_ANCHOR_Y, PLAYER_EYE_HEIGHT } from '../constants/player';

/** Floor clearance so steep upward look cannot push shoulder cameras underground. */
const MIN_CAMERA_HEIGHT = 0.25;

/**
 * Positions the camera for the active mode from the shared player transform
 * and the soldier's current head-anchor height. Called every frame — pure
 * placement, no state writes.
 */
export function applyCameraMode(camera: Camera, mode: CameraMode, transform: PlayerTransform, bodyAnchorY: number): void {
  switch (mode) {
    case 'fps':
      // Pre-mount fallback only: once LocalPlayer resolves its head bone it
      // re-places the camera later in the same frame, overwriting this rig.
      placeShoulderCamera(camera, transform, bodyAnchorY, {
        distance: -0.25,
        bodyLift: PLAYER_EYE_HEIGHT - 0.05 - DEFAULT_BODY_ANCHOR_Y,
        shoulderOffset: 0,
      });
      break;
    case 'ots':
      placeShoulderCamera(camera, transform, bodyAnchorY, {
        distance: 0.75,
        bodyLift: 0.43,
        shoulderOffset: 0,
      });
      break;
    case 'tps':
      placeShoulderCamera(camera, transform, bodyAnchorY, {
        distance: 1.25,
        bodyLift: 0.63,
        shoulderOffset: 0,
      });
      break;
  }
}

interface ShoulderRig {
  /** Meters back along the look direction (shrinks as pitch rises). */
  distance: number;
  /** Neutral camera height above the body anchor at level look (meters). */
  bodyLift: number;
  /** Lateral shift toward the right shoulder (meters). */
  shoulderOffset: number;
}

function placeShoulderCamera(
  camera: Camera,
  transform: PlayerTransform,
  bodyAnchorY: number,
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
    Math.max(bodyAnchorY + rig.bodyLift - dirY * rig.distance, MIN_CAMERA_HEIGHT),
    transform.z - dirZ * rig.distance + rightZ * rig.shoulderOffset,
  );
  camera.rotation.set(transform.pitch, transform.yaw, 0);
}
