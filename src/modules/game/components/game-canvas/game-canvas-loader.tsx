import { useLoaderStore } from '@/modules/game/stores/loader.store';
import { PlayLoader } from '../play-loader';

export function GameCanvasLoader() {
  const { loader } = useLoaderStore();

  if (!loader)
    return null;

  return (
    <PlayLoader
      label={loader.label}
      progress={loader.progress}
    />
  );
}
