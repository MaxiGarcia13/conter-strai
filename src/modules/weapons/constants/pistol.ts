import type { HitZone } from '@/modules/combat';

/** Maximum pistol engagement range (meters). Shared with client raycast far plane. */
export const PISTOL_MAX_RANGE_METERS = 100;

/** Minimum interval between pistol shots (ms). Mirrors `fireCooldownSeconds`. */
export const PISTOL_FIRE_COOLDOWN_MS = 200;

/** Shots per full magazine. */
export const PISTOL_MAGAZINE_SIZE = 12;

/** Distance (meters) within which a wall hit spawns a cosmetic impact mark. */
export const CLOSE_RANGE_IMPACT_METERS = 10;

/** Per-zone fractions of max HP for the pistol — server and client authority. */
export const PISTOL_DAMAGE_BY_ZONE: Record<HitZone, number> = {
  head: 0.4,
  body: 0.2,
  limb: 0.15,
};
