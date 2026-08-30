import { useEffect, useRef } from 'react';
import { useDeferredDreiProgress } from '../hooks/use-deferred-drei-progress';
import { useLoaderStore } from '../stores/loader.store';

interface LoadingReporterProps {

}

/** Bridges drei loading manager progress to a DOM overlay outside the canvas. */
export function LoadingReporter(_props: LoadingReporterProps) {
  const { progress, active } = useDeferredDreiProgress();
  const hasStartedRef = useRef(false);
  const activeRef = useRef(active);
  const progressRef = useRef(progress);
  const { setLoader } = useLoaderStore();

  activeRef.current = active;
  progressRef.current = progress;

  useEffect(() => {
    setLoader({ label: 'Deploying', progress: 0 });
  }, []);

  useEffect(() => {
    if (active) {
      hasStartedRef.current = true;
    }

    setLoader({
      label: 'Deploying',
      progress: Math.min(100, Math.round(progress)),
    });
  }, [active, progress]);

  return null;
}
