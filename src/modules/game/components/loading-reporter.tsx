import type { PlayLoaderState } from './play-loader';
import { useCallback, useEffect, useRef } from 'react';
import { canClearDeployLoader } from '../dev/e2e-deploy-hold';
import { useE2eDeployHoldRelease } from '../dev/use-e2e-deploy-hold-release';
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

  const tryClearLoader = useCallback(() => {
    if (canClearDeployLoader(hasStartedRef.current, activeRef.current, progressRef.current)) {
      onLoaderChange(null);
    }
  }, [onLoaderChange]);

  useE2eDeployHoldRelease(tryClearLoader);

  useEffect(() => {
    onLoaderChange({ label: 'Deploying', progress: 0 });
  }, [onLoaderChange]);

  useEffect(() => {
    if (active) {
      hasStartedRef.current = true;
    }

    if (canClearDeployLoader(hasStartedRef.current, active, progress)) {
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
