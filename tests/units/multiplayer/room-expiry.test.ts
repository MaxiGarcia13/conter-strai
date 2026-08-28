import { afterEach, describe, expect, it, vi } from 'vitest';
import { ROOM_CODE_TTL_MS } from '@/modules/multiplayer/constants/room-ttl';
import { assertRoomJoinable, computeExpiresAt, isRoomExpired } from '@/modules/multiplayer/utils/room-expiry';

afterEach(() => {
  vi.useRealTimers();
});

describe('computeExpiresAt', () => {
  it('adds the default 40 min TTL to now', () => {
    const now = Date.UTC(2026, 7, 28, 12, 0, 0);
    vi.setSystemTime(now);
    expect(computeExpiresAt(now)).toBe('2026-08-28T12:40:00.000Z');
    expect(Date.parse(computeExpiresAt(now)) - now).toBe(ROOM_CODE_TTL_MS);
  });
});

describe('isRoomExpired', () => {
  it('returns true when expiresAt is in the past', () => {
    vi.setSystemTime(Date.UTC(2026, 7, 28, 12, 0, 0));
    expect(isRoomExpired('2026-08-28T11:59:59.000Z')).toBe(true);
  });

  it('returns false for a future expiry', () => {
    vi.setSystemTime(Date.UTC(2026, 7, 28, 12, 0, 0));
    expect(isRoomExpired('2026-08-28T12:00:01.000Z')).toBe(false);
  });

  it('returns false for missing or malformed values', () => {
    expect(isRoomExpired(undefined)).toBe(false);
    expect(isRoomExpired('not-a-date')).toBe(false);
  });
});

describe('assertRoomJoinable', () => {
  it('throws when expiresAt is in the past', () => {
    vi.setSystemTime(Date.UTC(2026, 7, 28, 12, 0, 0));
    expect(() => assertRoomJoinable('2026-08-28T11:59:59.000Z')).toThrow('Room expired');
  });

  it('allows a future expiry', () => {
    vi.setSystemTime(Date.UTC(2026, 7, 28, 12, 0, 0));
    expect(() => assertRoomJoinable('2026-08-28T12:40:00.000Z')).not.toThrow();
  });
});
