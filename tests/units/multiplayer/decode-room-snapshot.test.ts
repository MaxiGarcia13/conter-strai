import { describe, expect, it } from 'vitest';
import { decodeRoomSnapshot } from '@/modules/multiplayer/adapters/decode-room-snapshot';
import { createEmptyRoomSnapshot } from '@/modules/multiplayer/adapters/to-room-snapshot';

const SNAPSHOT = createEmptyRoomSnapshot('ABC123', 'arena-01');

describe('decodeRoomSnapshot', () => {
  it('accepts a waiting-room snapshot', () => {
    expect(decodeRoomSnapshot(SNAPSHOT)).toEqual(SNAPSHOT);
  });

  it('rejects missing teams or a short id', () => {
    expect(decodeRoomSnapshot({ ...SNAPSHOT, id: 'AB' })).toBeNull();
    expect(decodeRoomSnapshot({ ...SNAPSHOT, teams: { civilian: SNAPSHOT.teams.civilian } })).toBeNull();
  });
});
