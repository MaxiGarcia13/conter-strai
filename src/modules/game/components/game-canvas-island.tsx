import type { PlayLoaderState } from './play-loader';
import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { PlayLoader } from './play-loader';

const GameCanvas = lazy(async () => {
  const module = await import('./game-canvas');
  return { default: module.GameCanvas };
});

const BOOT_LOADER: PlayLoaderState = {
  label: 'Loading engine',
  progress: null,
};

export function GameCanvasIsland() {
  const [visible, setVisible] = useState(true);
  const [loader, setLoader] = useState<PlayLoaderState>(BOOT_LOADER);

  useEffect(() => {
    document.getElementById('play-boot')?.remove();
  }, []);

  const handleLoaderChange = useCallback((state: PlayLoaderState | null) => {
    if (state === null) {
      setVisible(false);
      return;
    }
    setLoader(state);
    setVisible(true);
  }, []);

  return (
    <>
      {visible && <PlayLoader {...loader} />}
      <Suspense fallback={null}>
        <GameCanvas onLoaderChange={handleLoaderChange} />
      </Suspense>
    </>
  );
}
