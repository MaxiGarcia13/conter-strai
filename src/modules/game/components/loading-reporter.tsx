import type { PlayLoaderState } from './play-loader';
import { useProgress } from '@react-three/drei';
import { useEffect, useRef } from 'react';

interface LoadingReporterProps {
  onLoaderChange: (state: PlayLoaderState | null) => void;
}

/** Bridges drei loading manager progress to a DOM overlay outside the canvas. */
export function LoadingReporter({ onLoaderChange }: LoadingReporterProps) {
  const { progress, active } = useProgress();
  const hasStartedRef = useRef(false);

  useEffect(() => {
    onLoaderChange({ label: 'Deploying', progress: 0 });
  }, [onLoaderChange]);

  useEffect(() => {
    if (active) {
      hasStartedRef.current = true;
    }

    if (hasStartedRef.current && !active && progress >= 100) {
      onLoaderChange(null);
      return;
    }

    onLoaderChange({
      label: 'Deploying',
      progress: Math.min(100, Math.round(progress)),
    });
  }, [active, onLoaderChange, progress]);

  return null;
}
