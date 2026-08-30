import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { useDeferredDreiProgress } from '../hooks/use-deferred-drei-progress';

interface DeferredAfterLoadProps {
  children: ReactNode;
}

/** Renders children only after environment assets finish loading. */
export function DeferredAfterLoad({ children }: DeferredAfterLoadProps) {
  const [ready, setReady] = useState(false);
  const { active } = useDeferredDreiProgress();

  useEffect(() => {
    if (!active) {
      setReady(true);
    }
  }, [active]);

  if (!ready) {
    return null;
  }

  return children;
}
