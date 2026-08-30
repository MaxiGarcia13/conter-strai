import type { ComponentProps } from 'react';
import { lazy, Suspense } from 'react';

const PlayLoader = lazy(async () => {
  const module = await import('./play-loader');
  return { default: module.PlayLoader };
});

export function LazyPlayLoader(props: ComponentProps<typeof PlayLoader>) {
  return (
    <Suspense fallback={null}>
      <PlayLoader {...props} />
    </Suspense>
  );
}
