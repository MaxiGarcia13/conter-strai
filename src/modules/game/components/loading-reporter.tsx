import type { PlayLoaderState } from './play-loader';
import { useEffect, useRef } from 'react';
import { useDeferredDreiProgress } from '../hooks/use-deferred-drei-progress';

interface LoadingReporterProps {
  onLoaderChange: (state: PlayLoaderState | null) => void;
}

/** Bridges drei loading manager progress to a DOM overlay outside the canvas. */
export function LoadingReporter({ onLoaderChange }: LoadingReporterProps) {
  const { progress, active } = useDeferredDreiProgress();
  const hasStartedRef = useRef(false);
  const activeRef = useRef(active);
  const progressRef = useRef(progress);

  activeRef.current = active;
  progressRef.current = progress;

  useEffect(() => {
    onLoaderChange({ label: 'Deploying', progress: 0 });
  }, [onLoaderChange]);

  useEffect(() => {
    if (active) {
      hasStartedRef.current = true;
    }

    onLoaderChange({
      label: 'Deploying',
      progress: Math.min(100, Math.round(progress)),
    });
  }, [active, onLoaderChange, progress]);

  return null;
}
