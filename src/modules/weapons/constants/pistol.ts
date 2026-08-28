import type { HitZone } from '@/modules/combat';

/** Maximum pistol engagement range (meters). Shared with client raycast far plane. */
export const PISTOL_MAX_RANGE_METERS = 100;

/** Minimum interval between pistol shots (ms). Mirrors `fireCooldownSeconds`. */
export const PISTOL_FIRE_COOLDOWN_MS = 350;

/** Per-zone fractions of max HP for the pistol — server and client authority. */
export const PISTOL_DAMAGE_BY_ZONE: Record<HitZone, number> = {
  head: 0.4,
  body: 0.2,
  limb: 0.15,
};
