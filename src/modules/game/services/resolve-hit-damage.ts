import type { DamageData, HitZone } from '@/modules/combat';
import type { EntityId } from '@/modules/soldiers';
import type { Team } from '@/modules/teams';
import type { BulletHitResult } from '@/modules/weapons/types';

export interface ResolveHitDamageInput {
  hit: BulletHitResult;
  attackerId: EntityId;
  attackerTeam: Team;
  weaponId: string;
  roster?: { entityId: EntityId; team: Team }[];
}

/**
 * Pure function: converts a raycast hit into `DamageData` (or null for
 * self-hits / friendly fire).  No side effects — safe for Vitest.
 */
export function resolveHitDamage(input: ResolveHitDamageInput): DamageData | null {
  const { hit, attackerId, attackerTeam, weaponId, roster } = input;

  if (!hit.entityId || !hit.hitZone) {
    return null;
  }
  if (hit.entityId === attackerId) {
    return null;
  }

  if (roster) {
    const targetEntry = roster.find((e) => e.entityId === hit.entityId);
    if (targetEntry && targetEntry.team === attackerTeam) {
      return null;
    }
  }

  return {
    attackerId,
    targetId: hit.entityId,
    zone: hit.hitZone as HitZone,
    weaponId,
  };
}
