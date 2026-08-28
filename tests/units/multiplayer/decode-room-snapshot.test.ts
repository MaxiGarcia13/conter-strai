import { describe, expect, it } from 'vitest';
import { decodeRoomSnapshot } from '@/modules/multiplayer/adapters/decode-room-snapshot';
import { createEmptyRoomSnapshot } from '@/modules/multiplayer/adapters/to-room-snapshot';

const SNAPSHOT = createEmptyRoomSnapshot('ABC123', '2099-01-01T00:00:00.000Z', 'arena-01');

describe('decodeRoomSnapshot', () => {
  it('accepts a waiting-room snapshot', () => {
    expect(decodeRoomSnapshot(SNAPSHOT)).toEqual(SNAPSHOT);
  });

  it('rejects missing teams or a short id', () => {
    expect(decodeRoomSnapshot({ ...SNAPSHOT, id: 'AB' })).toBeNull();
    expect(decodeRoomSnapshot({ ...SNAPSHOT, teams: { civilian: SNAPSHOT.teams.civilian } })).toBeNull();
  });

  it('rejects a missing or invalid expiresAt', () => {
    const { expiresAt, ...withoutExpiry } = SNAPSHOT;
    expect(decodeRoomSnapshot(withoutExpiry)).toBeNull();
    expect(decodeRoomSnapshot({ ...SNAPSHOT, expiresAt: 'not-a-date' })).toBeNull();
  });
});
