import type { ComponentProps } from 'react';
import { lazy, Suspense } from 'react';

const LocalPlayer = lazy(async () => {
  const module = await import('./local-player');
  return { default: module.LocalPlayer };
});

export function LazyLocalPlayer(props: ComponentProps<typeof LocalPlayer>) {
  return (
    <Suspense fallback={null}>
      <LocalPlayer {...props} />
    </Suspense>
  );
}
