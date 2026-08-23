import type { EntityId, HitZone } from '@/modules/soldiers';

export interface PistolWeaponConfig {
  id: string;
  name: string;
  /** Minimum seconds between shots. */
  fireCooldownSeconds: number;
}

export interface BulletHitResult {
  /** Struck soldier; null when the ray hits scenery. */
  entityId: EntityId | null;
  hitZone: HitZone | null;
  /** World-space impact point. */
  point: [number, number, number];
  distance: number;
}

/** Weapons carried into a round; MVP ships pistol-only. */
export interface Loadout {
  sidearmId: string;
}
