import { describe, expect, it } from 'vitest';
import { ROOM_SNAPSHOT_POLL_MS } from '@/modules/lobby/constants/query';
import { roomSnapshotRefetchInterval } from '@/modules/lobby/utils/room-snapshot-refetch-interval';

describe('roomSnapshotRefetchInterval', () => {
  it('does not poll when poll is off', () => {
    expect(roomSnapshotRefetchInterval(false, 'success', 'waiting')).toBe(false);
  });

  it('does not poll after an error', () => {
    expect(roomSnapshotRefetchInterval(true, 'error', 'waiting')).toBe(false);
  });

  it('polls while the room is waiting', () => {
    expect(roomSnapshotRefetchInterval(true, 'success', 'waiting')).toBe(ROOM_SNAPSHOT_POLL_MS);
    expect(roomSnapshotRefetchInterval(true, 'pending', undefined)).toBe(ROOM_SNAPSHOT_POLL_MS);
  });

  it('stops polling after waiting ends', () => {
    expect(roomSnapshotRefetchInterval(true, 'success', 'in_progress')).toBe(false);
    expect(roomSnapshotRefetchInterval(true, 'success', 'ended')).toBe(false);
  });
});
