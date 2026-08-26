import { DevFreeCamera } from './dev-free-camera';
import { PlayTestHook } from './play-test-hook';

/** In-canvas DEV tools — free-cam + Playwright probe. Lazy-loaded only in DEV. */
export function DevSceneTools() {
  return (
    <>
      <PlayTestHook />
      <DevFreeCamera />
    </>
  );
}
