import { useEffect } from 'react';
import { toggleFreeCamera } from './free-camera-state';

const TOGGLE_KEY = 'KeyV';

/** Listens for KeyV to toggle free-cam mode. */
export function useFreeCameraToggle(): void {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.repeat || event.code !== TOGGLE_KEY) {
        return;
      }
      toggleFreeCamera();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);
}
