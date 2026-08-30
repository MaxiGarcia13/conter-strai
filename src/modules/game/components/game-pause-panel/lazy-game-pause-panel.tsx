import type { ComponentProps } from 'react';
import { lazy, Suspense } from 'react';

const GamePausePanel = lazy(async () => {
  const module = await import('./game-pause-panel');
  return { default: module.GamePausePanel };
});

export function LazyGamePausePanel(props: ComponentProps<typeof GamePausePanel>) {
  return (
    <Suspense fallback={null}>
      <GamePausePanel {...props} />
    </Suspense>
  );
}
