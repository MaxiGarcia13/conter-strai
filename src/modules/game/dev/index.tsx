import { lazy, Suspense } from 'react';

const DevSceneTools = lazy(async () => {
  const module = await import('./dev-scene-tools');
  return { default: module.DevSceneTools };
});

const DevGameChrome = lazy(async () => {
  const module = await import('./dev-game-chrome');
  return { default: module.DevGameChrome };
});

export function LazyDevSceneTools() {
  return (
    <Suspense fallback={null}>
      <DevSceneTools />
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
