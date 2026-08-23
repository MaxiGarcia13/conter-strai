import type { HitZone } from '../types';

/** Damage as a fraction of max HP per hit zone. */
export const DAMAGE_ZONE_PCT = {
  head: 0.5,
  body: 0.2,
  limb: 0.15,
} as const satisfies Record<HitZone, number>;
