import { describe, expect, it } from 'vitest';
import { generateHostToken, isHostToken } from '@/modules/multiplayer/utils/host-token';

describe('generateHostToken', () => {
  it('produces unique opaque tokens', () => {
    const first = generateHostToken();
    const second = generateHostToken();
    expect(first).not.toBe(second);
    expect(first.length).toBeGreaterThanOrEqual(32);
    expect(second.length).toBeGreaterThanOrEqual(32);
  });
});

describe('isHostToken', () => {
  it('matches an equal token', () => {
    const token = generateHostToken();
    expect(isHostToken(token, token)).toBe(true);
  });

  it('rejects mismatched or different-length tokens', () => {
    expect(isHostToken('aaa', 'bbb')).toBe(false);
    expect(isHostToken('short', 'a-much-longer-token')).toBe(false);
  });
});
