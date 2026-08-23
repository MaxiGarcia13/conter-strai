import type { ReactNode } from 'react';
import { useProgress } from '@react-three/drei';
import { useEffect, useState } from 'react';

interface DeferredAfterLoadProps {
  children: ReactNode;
}

/** Renders children only after environment assets finish loading. */
export function DeferredAfterLoad({ children }: DeferredAfterLoadProps) {
  const [ready, setReady] = useState(false);
  const { active } = useProgress();

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
