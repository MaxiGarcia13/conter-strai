import type { SoldierSkinId } from '@/modules/soldiers';
import { lazy, Suspense } from 'react';

const DevSceneTools = lazy(async () => {
  const module = await import('./dev-scene-tools');
  return { default: module.DevSceneTools };
});

const DevGameChrome = lazy(async () => {
  const module = await import('./dev-game-chrome');
  return { default: module.DevGameChrome };
});

interface LazyDevSceneToolsProps {
  skinId: SoldierSkinId;
}

export function LazyDevSceneTools({ skinId }: LazyDevSceneToolsProps) {
  return (
    <Suspense fallback={null}>
      <DevSceneTools skinId={skinId} />
    </Suspense>
  );
}

export function LazyDevGameChrome() {
  return (
    <Suspense fallback={null}>
      <DevGameChrome />
    </Suspense>
  );
}
