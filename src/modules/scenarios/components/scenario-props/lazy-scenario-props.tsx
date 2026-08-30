import type { ComponentProps } from 'react';
import { lazy, Suspense } from 'react';

const ScenarioProps = lazy(async () => {
  const module = await import('./scenario-props');
  return { default: module.ScenarioProps };
});

export function LazyScenarioProps(props: ComponentProps<typeof ScenarioProps>) {
  return (
    <Suspense fallback={null}>
      <ScenarioProps {...props} />
    </Suspense>
  );
}
