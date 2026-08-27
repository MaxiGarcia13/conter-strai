import { useLocalTransformSync } from '../hooks/use-local-transform-sync';

/**
 * Mounts the per-frame local transform sync inside the Canvas. Renders nothing.
 */
export function LocalTransformSync() {
  useLocalTransformSync();
  return null;
}
