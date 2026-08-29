import { useEffect } from 'react';
import { GAME_BINDINGS } from '../constants/game-bindings';
import { toggleFreeCamera } from './free-camera-state';

/** Listens for KeyV to toggle free-cam mode. */
export function useFreeCameraToggle(): void {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.repeat || event.code !== GAME_BINDINGS.freeCamera.code) {
        return;
      }
      toggleFreeCamera();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);
}
