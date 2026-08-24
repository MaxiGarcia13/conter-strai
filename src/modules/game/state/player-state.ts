import type { CameraMode } from '../types';

import type { LocomotionState } from '@/modules/soldiers';

/**
 * Hot-path player truth shared by controls, camera, and the local soldier rig.
 * Mutated per frame — consumers read it inside their own frame callbacks;
 * never mirror it into React state. Only `mode` is subscribable (key-driven).
 */
export interface PlayerTransform {
  /** Ground-plane position (meters); Y is always 0. */
  x: number;
  z: number;
  /** Look angles in radians; yaw 0 faces −Z. */
  yaw: number;
  pitch: number;
}

export type CameraModeListener = (mode: CameraMode) => void;

const CAMERA_MODE_CYCLE: CameraMode[] = ['fps', 'ots', 'tps'];

const transform: PlayerTransform = { x: 0, z: 0, yaw: 0, pitch: 0 };
let locomotion: LocomotionState = 'idle';
let cameraMode: CameraMode = 'fps';
const modeListeners = new Set<CameraModeListener>();

export function getPlayerTransform(): PlayerTransform {
  return transform;
}

/** Places the player at a spawn; idempotent so mount order does not matter. */
export function resetPlayerTransform(x: number, z: number, yaw: number): void {
  transform.x = x;
  transform.z = z;
  transform.yaw = yaw;
  transform.pitch = 0;
}

export function getPlayerLocomotion(): LocomotionState {
  return locomotion;
}

export function setPlayerLocomotion(next: LocomotionState): void {
  locomotion = next;
}

export function getCameraMode(): CameraMode {
  return cameraMode;
}

export function cycleCameraMode(): CameraMode {
  const next = CAMERA_MODE_CYCLE[(CAMERA_MODE_CYCLE.indexOf(cameraMode) + 1) % CAMERA_MODE_CYCLE.length]!;
  cameraMode = next;
  for (const listener of modeListeners) {
    listener(next);
  }
  return next;
}

export function subscribeCameraMode(listener: CameraModeListener): () => void {
  modeListeners.add(listener);
  return () => {
    modeListeners.delete(listener);
  };
}
