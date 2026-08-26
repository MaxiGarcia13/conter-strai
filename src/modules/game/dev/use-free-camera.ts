import { useSyncExternalStore } from 'react';

import { isFreeCamera, subscribeFreeCamera } from './free-camera-state';

/** React view of the DEV ghost free-camera flag. */
export function useFreeCamera(): boolean {
  return useSyncExternalStore(subscribeFreeCamera, isFreeCamera);
}
