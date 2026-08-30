import type { ComponentProps } from 'react';
import { lazy, Suspense } from 'react';

const ScenarioGround = lazy(async () => {
  const module = await import('./scenario-ground');
  return { default: module.ScenarioGround };
});

export function LazyScenarioGround(props: ComponentProps<typeof ScenarioGround>) {
  return (
    <Suspense fallback={null}>
      <ScenarioGround {...props} />
    </Suspense>
  );
}
