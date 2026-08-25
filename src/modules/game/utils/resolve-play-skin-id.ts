import type { SoldierSkinId } from '@/modules/soldiers';

const DEFAULT_SKIN_ID: SoldierSkinId = 'swat-1';

/** Resolves `/play?skin=` for e2e / manual probes; defaults to `swat-1`. Select UI is US-7. */
export function resolvePlaySkinId(
  search = typeof window !== 'undefined' ? window.location.search : '',
): SoldierSkinId {
  const skin = new URLSearchParams(search).get('skin');
  if (skin === 'remy' || skin === 'swat-1') {
    return skin;
  }
  return DEFAULT_SKIN_ID;
}
