import type { ComponentProps } from 'react';
import { lazy, Suspense } from 'react';

const RemotePlayers = lazy(async () => {
  const module = await import('./remote-players');

  return { default: module.RemotePlayers };
});

export function LazyRemotePlayers(props: ComponentProps<typeof RemotePlayers>) {
  return (
    <Suspense fallback={null}>
      <RemotePlayers {...props} />
    </Suspense>
  );
}
