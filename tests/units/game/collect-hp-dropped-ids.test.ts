import { describe, expect, it } from 'vitest';
import { collectHpDroppedIds } from '@/modules/game/utils/collect-hp-dropped-ids';

describe('collectHpDroppedIds', () => {
  it('returns ids whose HP decreased', () => {
    const prev = { a: { currentHp: 100 }, b: { currentHp: 80 } };
    const next = { a: { currentHp: 60 }, b: { currentHp: 80 } };

    expect(collectHpDroppedIds(prev, next)).toEqual(['a']);
  });

  it('treats first sighting as full HP baseline', () => {
    const prev = {};
    const next = { peer: { currentHp: 80 } };

    expect(collectHpDroppedIds(prev, next)).toEqual(['peer']);
  });

  it('ignores HP increases and unchanged values', () => {
    const prev = { a: { currentHp: 50 }, b: { currentHp: 100 } };
    const next = { a: { currentHp: 80 }, b: { currentHp: 100 } };

    expect(collectHpDroppedIds(prev, next)).toEqual([]);
  });
});
