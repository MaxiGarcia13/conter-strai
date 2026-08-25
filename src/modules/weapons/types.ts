import type { HitZone } from '@/modules/combat';
import type { EntityId } from '@/modules/soldiers';

export interface PistolWeaponConfig {
  id: string;
  name: string;
  /** Minimum seconds between shots. */
  fireCooldownSeconds: number;
  /** Fraction of max HP dealt per hit zone, before difficulty. */
  damageByZone: Record<HitZone, number>;
  /** Runtime URL of the weapon GLB (served from public/). */
  modelUrl: string;
  /** Local euler radians on mixamorig RightHand (before meter→cm scale). */
  gripRotation?: [number, number, number];
  /** Local position in meters on RightHand after gripRotation (×100 at attach). */
  gripPosition?: [number, number, number];
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
