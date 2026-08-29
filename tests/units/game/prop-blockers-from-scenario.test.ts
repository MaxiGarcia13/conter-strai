import { describe, expect, it } from 'vitest';
import { propBlockersFromScenario } from '@/modules/game/utils/prop-blockers-from-scenario';
import { arena01 } from '@/modules/scenarios/maps/arena-01';

describe('propBlockersFromScenario', () => {
  it('produces collidable prop blockers for arena-01 jacaranda', () => {
    const blockers = propBlockersFromScenario(arena01);

    const jacaranda = blockers.filter((b) => b.entityId?.startsWith('jacaranda'));
    expect(jacaranda.length).toBeGreaterThanOrEqual(6);
    expect(jacaranda.length).toBeLessThanOrEqual(10);

    for (const blocker of jacaranda) {
      expect(blocker.radius).toBe(0.9);
      expect(Math.abs(blocker.x)).toBeLessThanOrEqual(50);
      expect(Math.abs(blocker.z)).toBeLessThanOrEqual(25);
    }
  });

  it('does not create blockers for non-collidable skirt jacaranda', () => {
    const blockers = propBlockersFromScenario(arena01);
    const outsideBounds = blockers.filter(
      (b) => Math.abs(b.x) > 50 || Math.abs(b.z) > 25,
    );
    expect(outsideBounds).toHaveLength(0);
  });

  it('yields no blockers for an empty scenario', () => {
    const blockers = propBlockersFromScenario({ ...arena01, props: [] });
    expect(blockers).toHaveLength(0);
  });
});
