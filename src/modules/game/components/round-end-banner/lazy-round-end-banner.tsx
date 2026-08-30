import type { ComponentProps } from 'react';
import { lazy, Suspense } from 'react';

const RoundEndBanner = lazy(async () => {
  const module = await import('./round-end-banner');
  return { default: module.RoundEndBanner };
});

export function LazyRoundEndBanner(props: ComponentProps<typeof RoundEndBanner>) {
  return (
    <Suspense fallback={null}>
      <RoundEndBanner {...props} />
    </Suspense>
  );
}
