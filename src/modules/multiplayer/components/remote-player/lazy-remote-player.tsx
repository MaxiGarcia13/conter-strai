import type { ComponentProps } from 'react';
import { lazy, Suspense } from 'react';

const RemotePlayer = lazy(async () => {
  const module = await import('./remote-player');

  return { default: module.RemotePlayer };
});

export function LazyRemotePlayer(props: ComponentProps<typeof RemotePlayer>) {
  return (
    <Suspense fallback={null}>
      <RemotePlayer {...props} />
    </Suspense>
  );
}
