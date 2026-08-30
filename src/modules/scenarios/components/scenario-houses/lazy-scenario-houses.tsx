import type { ComponentProps } from 'react';
import { lazy, Suspense } from 'react';

const ScenarioHouses = lazy(async () => {
  const module = await import('./scenario-houses');
  return { default: module.ScenarioHouses };
});

export function LazyScenarioHouses(props: ComponentProps<typeof ScenarioHouses>) {
  return (
    <Suspense fallback={null}>
      <ScenarioHouses {...props} />
    </Suspense>
  );
}
