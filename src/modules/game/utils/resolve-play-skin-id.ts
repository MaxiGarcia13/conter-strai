import type { SoldierSkinId } from '@/modules/soldiers';
import { DEFAULT_PLAY_SKIN_ID } from '../constants/player';

const PLAY_SKIN_IDS = new Set<SoldierSkinId>([
  'remy',
  'james',
  'liza',
  'swat-1',
  'swat-2',
  'swat-3',
]);

/** Resolves `/play?skin=` for e2e / manual probes; defaults to `remy`. Select UI is US-7. */
export function resolvePlaySkinId(
  search = typeof window !== 'undefined' ? window.location.search : '',
): SoldierSkinId {
  const skin = new URLSearchParams(search).get('skin');
  if (skin && PLAY_SKIN_IDS.has(skin as SoldierSkinId)) {
    return skin as SoldierSkinId;
  }
  return DEFAULT_PLAY_SKIN_ID;
}
