import type { CameraMode } from '../types';
import { useSyncExternalStore } from 'react';

import { getCameraMode, subscribeCameraMode } from '../stores/player-state';

/** React view of the camera mode; re-renders only when F cycles it. */
export function useCameraMode(): CameraMode {
  return useSyncExternalStore(subscribeCameraMode, getCameraMode);
}
