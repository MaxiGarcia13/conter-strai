import { useProgress } from '@react-three/drei';
import { useEffect, useState } from 'react';

export interface DreiProgressSnapshot {
  active: boolean;
  progress: number;
}

function pick(state: DreiProgressSnapshot): DreiProgressSnapshot {
  return { active: state.active, progress: state.progress };
}

/**
 * Snapshot of drei's loading store without the `useProgress()` hook.
 * DefaultLoadingManager updates that store synchronously inside `useLoader`,
 * which would setState subscribers during ScenarioGround / ScenarioHouses render.
 */
export function useDeferredDreiProgress(): DreiProgressSnapshot {
  const [snapshot, setSnapshot] = useState(() => pick(useProgress.getState()));

  useEffect(() => {
    let cancelled = false;

    const sync = () => {
      if (cancelled) {
        return;
      }
      const next = pick(useProgress.getState());
      setSnapshot((prev) => (
        prev.active === next.active && prev.progress === next.progress ? prev : next
      ));
    };

    sync();
    const unsubscribe = useProgress.subscribe(() => {
      queueMicrotask(sync);
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  return snapshot;
}
