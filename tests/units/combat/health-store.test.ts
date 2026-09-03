import type { HealthSystem } from '@/modules/combat';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useHealthStore } from '@/modules/combat/health-store';
import { requestInjurySound } from '@/modules/combat/injury-sound-events';
import { DEFAULT_WEAPON_ID } from '@/modules/weapons/weapon-registry';

vi.mock('@/modules/combat/injury-sound-events', () => ({
  requestInjurySound: vi.fn(),
}));

const requestInjurySoundMock = vi.mocked(requestInjurySound);

function pistolHeadHit(attackerId: string, targetId: string) {
  return useHealthStore
    .getState()
    .applyDamage({ attackerId, targetId, zone: 'head', weaponId: DEFAULT_WEAPON_ID });
}

describe('health-store', () => {
  beforeEach(() => {
    useHealthStore.getState().resetAll();
    requestInjurySoundMock.mockClear();
  });

  it('implements the HealthSystem contract', () => {
    const system: HealthSystem = useHealthStore.getState();
    expect(system.getHealth).toBeTypeOf('function');
    expect(system.applyDamage).toBeTypeOf('function');
    expect(system.resetAll).toBeTypeOf('function');
  });

  it('enters unknown targets at full HP and applies weapon-zone damage', () => {
    const nextHp = pistolHeadHit('player-1', 'npc-1');

    expect(nextHp).toBeCloseTo(60);
    expect(requestInjurySoundMock).toHaveBeenCalledExactlyOnceWith('npc-1');
    expect(useHealthStore.getState().getHealth('npc-1')).toEqual({
      currentHp: expect.closeTo(60),
      maxHp: 100,
      isEliminated: false,
    });
  });

  it('eliminates at 0 HP and keeps the flag until resetAll', () => {
    pistolHeadHit('player-1', 'npc-1');
    pistolHeadHit('player-1', 'npc-1');
    const finalHp = pistolHeadHit('player-1', 'npc-1');

    expect(finalHp).toBe(0);
    expect(useHealthStore.getState().getHealth('npc-1')?.isEliminated).toBe(true);
    expect(requestInjurySoundMock).toHaveBeenCalledTimes(3);

    useHealthStore.getState().resetAll();
    expect(useHealthStore.getState().getHealth('npc-1')).toBeUndefined();
  });

  it('scales incoming damage with difficulty', () => {
    useHealthStore.getState().setDifficulty('easy');

    const nextHp = pistolHeadHit('player-1', 'npc-1');

    expect(nextHp).toBeCloseTo(70);
  });

  it('throws on an unknown weapon id', () => {
    expect(() =>
      useHealthStore.getState().applyDamage({
        attackerId: 'player-1',
        targetId: 'npc-1',
        zone: 'body',
        weaponId: 'ghost-weapon',
      }),
    ).toThrow();
  });
});
