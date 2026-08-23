import type { SoldierSkin, SoldierSkinId } from './types';
import { soldierSkins } from './soldier-skin-registry';

export function getSoldierSkinById(id: SoldierSkinId): SoldierSkin {
  if (!(id in soldierSkins)) {
    throw new Error(`Unknown soldier skin id: ${id}`);
  }
  return soldierSkins[id];
}
