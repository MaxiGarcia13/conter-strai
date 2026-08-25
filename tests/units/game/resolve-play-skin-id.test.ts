import { describe, expect, it } from 'vitest';

import { resolvePlaySkinId } from '@/modules/game/utils/resolve-play-skin-id';

describe('resolvePlaySkinId', () => {
  it('defaults to swat-1', () => {
    expect(resolvePlaySkinId('')).toBe('swat-1');
    expect(resolvePlaySkinId('?')).toBe('swat-1');
    expect(resolvePlaySkinId('?skin=unknown')).toBe('swat-1');
  });

  it('accepts all registered skins', () => {
    expect(resolvePlaySkinId('?skin=remy')).toBe('remy');
    expect(resolvePlaySkinId('?skin=james')).toBe('james');
    expect(resolvePlaySkinId('?skin=liza')).toBe('liza');
    expect(resolvePlaySkinId('?skin=swat-1')).toBe('swat-1');
    expect(resolvePlaySkinId('?skin=swat-2')).toBe('swat-2');
    expect(resolvePlaySkinId('?skin=swat-3')).toBe('swat-3');
  });
});
