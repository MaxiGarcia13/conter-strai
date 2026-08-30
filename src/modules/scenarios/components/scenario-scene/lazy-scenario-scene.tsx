import type { ComponentProps } from 'react';
import { lazy, Suspense } from 'react';

const ScenarioScene = lazy(async () => {
  const module = await import('./scenario-scene');
  return { default: module.ScenarioScene };
});

export function LazyScenarioScene(props: ComponentProps<typeof ScenarioScene>) {
  return (
    <Suspense fallback={null}>
      <ScenarioScene {...props} />
    </Suspense>
  );
}
