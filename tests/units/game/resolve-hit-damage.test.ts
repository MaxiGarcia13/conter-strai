import type { ResolveHitDamageInput } from '@/modules/game/services/resolve-hit-damage';
import type { BulletHitResult } from '@/modules/weapons/types';
import { describe, expect, it } from 'vitest';
import { resolveHitDamage } from '@/modules/game/services/resolve-hit-damage';

function baseHit(overrides: Partial<BulletHitResult> = {}): BulletHitResult {
  return {
    entityId: 'civilian-0',
    hitZone: 'body',
    point: [1, 0, 2],
    distance: 5,
    ...overrides,
  };
}

function baseInput(overrides: Partial<ResolveHitDamageInput> = {}): ResolveHitDamageInput {
  return {
    hit: baseHit(),
    attackerId: 'local-player',
    attackerTeam: 'soldier',
    weaponId: 'pistol',
    ...overrides,
  };
}

describe('resolveHitDamage', () => {
  it('returns DamageData for a valid enemy hit', () => {
    const result = resolveHitDamage(baseInput());
    expect(result).toEqual({
      attackerId: 'local-player',
      targetId: 'civilian-0',
      zone: 'body',
      weaponId: 'pistol',
    });
  });

  it('returns null when entityId is missing', () => {
    const result = resolveHitDamage(baseInput({ hit: baseHit({ entityId: null }) }));
    expect(result).toBeNull();
  });

  it('returns null when hitZone is missing', () => {
    const result = resolveHitDamage(baseInput({ hit: baseHit({ hitZone: null }) }));
    expect(result).toBeNull();
  });

  it('returns null for self-hit', () => {
    const result = resolveHitDamage(baseInput({
      hit: baseHit({ entityId: 'local-player' }),
    }));
    expect(result).toBeNull();
  });

  it('returns null for friendly fire when roster is provided', () => {
    const result = resolveHitDamage(baseInput({
      hit: baseHit({ entityId: 'soldier-0' }),
      roster: [
        { entityId: 'local-player', team: 'soldier' },
        { entityId: 'soldier-0', team: 'soldier' },
        { entityId: 'civilian-0', team: 'civilian' },
      ],
    }));
    expect(result).toBeNull();
  });

  it('allows hit when roster is not provided (no friendly-fire check)', () => {
    const result = resolveHitDamage(baseInput({
      hit: baseHit({ entityId: 'soldier-0' }),
    }));
    expect(result).not.toBeNull();
    expect(result?.targetId).toBe('soldier-0');
  });

  it('allows hit on unknown entity not in roster', () => {
    const result = resolveHitDamage(baseInput({
      hit: baseHit({ entityId: 'unknown-entity' }),
      roster: [
        { entityId: 'local-player', team: 'soldier' },
        { entityId: 'civilian-0', team: 'civilian' },
      ],
    }));
    expect(result).not.toBeNull();
    expect(result?.targetId).toBe('unknown-entity');
  });

  it('preserves headshot zone', () => {
    const result = resolveHitDamage(baseInput({ hit: baseHit({ hitZone: 'head' }) }));
    expect(result?.zone).toBe('head');
  });

  it('preserves limb zone', () => {
    const result = resolveHitDamage(baseInput({ hit: baseHit({ hitZone: 'limb' }) }));
    expect(result?.zone).toBe('limb');
  });
});
