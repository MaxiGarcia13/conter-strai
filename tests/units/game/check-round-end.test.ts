import type { HealthState, HealthSystem } from '@/modules/combat';
import type { RosterEntry } from '@/modules/game/utils/check-round-end';
import type { EntityId } from '@/modules/soldiers';
import { describe, expect, it } from 'vitest';
import { checkRoundEnd } from '@/modules/game/utils/check-round-end';

function stubHealthSystem(healthMap: Record<EntityId, HealthState>): HealthSystem {
  return {
    getHealth: (id) => healthMap[id],
    applyDamage: () => 0,
    resetAll: () => {},
  };
}

function alive(hp = 100): HealthState {
  return { currentHp: hp, maxHp: 100, isEliminated: false };
}

function eliminated(): HealthState {
  return { currentHp: 0, maxHp: 100, isEliminated: true };
}

describe('checkRoundEnd', () => {
  it('returns ended=false when no roster entries exist', () => {
    const result = checkRoundEnd({
      roster: [],
      healthSystem: stubHealthSystem({}),
    });
    expect(result.ended).toBe(false);
  });

  it('returns ended=false when both teams have survivors', () => {
    const roster: RosterEntry[] = [
      { entityId: 'soldier-0', team: 'soldier' },
      { entityId: 'civilian-0', team: 'civilian' },
    ];
    const result = checkRoundEnd({
      roster,
      healthSystem: stubHealthSystem({
        'soldier-0': alive(),
        'civilian-0': alive(),
      }),
    });
    expect(result.ended).toBe(false);
  });

  it('returns ended=true with civilian winner when all soldiers eliminated', () => {
    const roster: RosterEntry[] = [
      { entityId: 'soldier-0', team: 'soldier' },
      { entityId: 'soldier-1', team: 'soldier' },
      { entityId: 'civilian-0', team: 'civilian' },
    ];
    const result = checkRoundEnd({
      roster,
      healthSystem: stubHealthSystem({
        'soldier-0': eliminated(),
        'soldier-1': eliminated(),
        'civilian-0': alive(),
      }),
    });
    expect(result.ended).toBe(true);
    expect(result.winner).toBe('civilian');
  });

  it('returns ended=true with soldier winner when all civilians eliminated', () => {
    const roster: RosterEntry[] = [
      { entityId: 'soldier-0', team: 'soldier' },
      { entityId: 'civilian-0', team: 'civilian' },
      { entityId: 'civilian-1', team: 'civilian' },
    ];
    const result = checkRoundEnd({
      roster,
      healthSystem: stubHealthSystem({
        'soldier-0': alive(),
        'civilian-0': eliminated(),
        'civilian-1': eliminated(),
      }),
    });
    expect(result.ended).toBe(true);
    expect(result.winner).toBe('soldier');
  });

  it('does not end when only some members of a team are eliminated', () => {
    const roster: RosterEntry[] = [
      { entityId: 'soldier-0', team: 'soldier' },
      { entityId: 'soldier-1', team: 'soldier' },
      { entityId: 'civilian-0', team: 'civilian' },
    ];
    const result = checkRoundEnd({
      roster,
      healthSystem: stubHealthSystem({
        'soldier-0': eliminated(),
        'soldier-1': alive(),
        'civilian-0': alive(),
      }),
    });
    expect(result.ended).toBe(false);
  });

  it('treats missing health entry as alive — soldier wiped → civilian wins', () => {
    const roster: RosterEntry[] = [
      { entityId: 'soldier-0', team: 'soldier' },
      { entityId: 'civilian-0', team: 'civilian' },
    ];
    const result = checkRoundEnd({
      roster,
      healthSystem: stubHealthSystem({
        'soldier-0': eliminated(),
        // civilian-0 not in map → treated as alive
      }),
    });
    expect(result.ended).toBe(true);
    expect(result.winner).toBe('civilian');
  });

  it('handles single-member teams', () => {
    const roster: RosterEntry[] = [
      { entityId: 'local-player', team: 'soldier' },
      { entityId: 'civilian-0', team: 'civilian' },
    ];
    const result = checkRoundEnd({
      roster,
      healthSystem: stubHealthSystem({
        'local-player': eliminated(),
        'civilian-0': alive(),
      }),
    });
    expect(result.ended).toBe(true);
    expect(result.winner).toBe('civilian');
  });
});
