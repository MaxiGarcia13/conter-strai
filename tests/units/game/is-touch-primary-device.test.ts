import { afterEach, describe, expect, it, vi } from 'vitest';
import { isTouchPrimaryDevice } from '@/modules/game/input/utils/is-touch-primary-device';

describe('isTouchPrimaryDevice', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns false when window or matchMedia is unavailable', () => {
    expect(isTouchPrimaryDevice()).toBe(false);
  });

  it('returns false when pointer: coarse does not match', () => {
    vi.stubGlobal('window', { matchMedia: vi.fn().mockReturnValue({ matches: false }) });
    expect(isTouchPrimaryDevice()).toBe(false);
  });

  it('returns true when pointer: coarse matches', () => {
    vi.stubGlobal('window', { matchMedia: vi.fn().mockReturnValue({ matches: true }) });
    expect(isTouchPrimaryDevice()).toBe(true);
  });
});
