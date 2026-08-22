import type { PropDefinition } from './types';
import { props } from './prop-registry';

export function getPropById(id: string): PropDefinition {
  if (!(id in props)) {
    throw new Error(`Unknown prop id: ${id}`);
  }
  return props[id];
}
