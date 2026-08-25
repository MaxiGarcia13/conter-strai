import { describe, expect, it } from 'vitest';

import { resolvePlaySkinId } from '@/modules/game/utils/resolve-play-skin-id';

describe('resolvePlaySkinId', () => {
  it('defaults to swat-1', () => {
    expect(resolvePlaySkinId('')).toBe('swat-1');
    expect(resolvePlaySkinId('?')).toBe('swat-1');
    expect(resolvePlaySkinId('?skin=unknown')).toBe('swat-1');
  });

  it('accepts remy and swat-1', () => {
    expect(resolvePlaySkinId('?skin=remy')).toBe('remy');
    expect(resolvePlaySkinId('?skin=swat-1')).toBe('swat-1');
  });
});
