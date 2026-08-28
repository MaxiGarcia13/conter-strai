import { DEFAULT_MAX_HP } from '@/modules/combat/constants/health';

/** Returns entity ids whose HP decreased between two snapshots (first sighting uses max HP). */
export function collectHpDroppedIds(
  prevById: Record<string, { currentHp: number } | undefined>,
  nextById: Record<string, { currentHp: number } | undefined>,
): string[] {
  const ids = new Set([...Object.keys(prevById), ...Object.keys(nextById)]);
  const damaged: string[] = [];
  for (const entityId of ids) {
    const prevHp = prevById[entityId]?.currentHp;
    const nextHp = nextById[entityId]?.currentHp;
    if (nextHp === undefined) {
      continue;
    }
    const baselineHp = prevHp ?? DEFAULT_MAX_HP;
    if (nextHp < baselineHp) {
      damaged.push(entityId);
    }
  }
  return damaged;
}
