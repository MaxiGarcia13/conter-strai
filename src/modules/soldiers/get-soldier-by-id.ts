import type { SoldierDefinition, SoldierId } from './types';
import { soldiers } from './soldier-registry';

export function getSoldierById(id: SoldierId): SoldierDefinition {
  if (!(id in soldiers)) {
    throw new Error(`Unknown soldier id: ${id}`);
  }
  return soldiers[id];
}
