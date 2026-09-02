import { describe, expect, it } from 'vitest';
import { propBlockersFromScenario } from '@/modules/game/utils/prop-blockers-from-scenario';
import { arena01 } from '@/modules/scenarios/maps/arena-01';

describe('propBlockersFromScenario', () => {
  it('produces collidable prop blockers for arena-01 jacaranda', () => {
    const { circles } = propBlockersFromScenario(arena01);

    const jacaranda = circles.filter((b) => b.entityId?.startsWith('jacaranda'));
    expect(jacaranda.length).toBeGreaterThanOrEqual(6);
    expect(jacaranda.length).toBeLessThanOrEqual(10);

    for (const blocker of jacaranda) {
      expect(blocker.radius).toBe(0.9);
      expect(Math.abs(blocker.x)).toBeLessThanOrEqual(50);
      expect(Math.abs(blocker.z)).toBeLessThanOrEqual(25);
    }
  });

  it('produces eight collidable concrete road barrier blockers inside playable bounds', () => {
    const { circles } = propBlockersFromScenario(arena01);

    const barriers = circles.filter((b) => b.entityId?.startsWith('concreteRoadBarrier'));
    expect(barriers).toHaveLength(8);

    for (const blocker of barriers) {
      expect(blocker.radius).toBe(0.6);
      expect(Math.abs(blocker.x)).toBeLessThanOrEqual(50);
      expect(Math.abs(blocker.z)).toBeLessThanOrEqual(25);
    }
  });

  it('produces oriented boxes for covered cars matching placement yaw', () => {
    const { circles, boxes } = propBlockersFromScenario(arena01);

    expect(circles.some((b) => b.entityId?.startsWith('coveredCar'))).toBe(false);
    expect(boxes).toHaveLength(3);

    for (const blocker of boxes) {
      expect(blocker.entityId).toMatch(/^coveredCar-/);
      expect(blocker.halfWidth).toBe(0.9);
      expect(blocker.halfDepth).toBe(2.19);
    }

    const byX = [...boxes].sort((a, b) => a.x - b.x);
    expect(byX[0]).toMatchObject({ x: -10, z: -5, yaw: 20 });
    expect(byX[1]).toMatchObject({ x: 0, z: -11, yaw: Math.PI / 2 });
    expect(byX[2]).toMatchObject({ x: 26, z: -4, yaw: 0 });
  });

  it('does not create blockers for non-collidable skirt jacaranda', () => {
    const { circles, boxes } = propBlockersFromScenario(arena01);
    const outsideBounds = [...circles, ...boxes].filter(
      (b) => Math.abs(b.x) > 50 || Math.abs(b.z) > 25,
    );
    expect(outsideBounds).toHaveLength(0);
  });

  it('yields no blockers for an empty scenario', () => {
    const blockers = propBlockersFromScenario({ ...arena01, props: [] });
    expect(blockers.circles).toHaveLength(0);
    expect(blockers.boxes).toHaveLength(0);
  });
});
