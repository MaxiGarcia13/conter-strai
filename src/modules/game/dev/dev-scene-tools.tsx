import type { SoldierSkinId } from '@/modules/soldiers';
import { DevFreeCamera } from './dev-free-camera';
import { PlayTestHook } from './play-test-hook';

interface DevSceneToolsProps {
  skinId: SoldierSkinId;
}

/** In-canvas DEV tools — free-cam + Playwright probe. Lazy-loaded only in DEV. */
export function DevSceneTools({ skinId }: DevSceneToolsProps) {
  return (
    <>
      <PlayTestHook skinId={skinId} />
      <DevFreeCamera />
    </>
  );
}
