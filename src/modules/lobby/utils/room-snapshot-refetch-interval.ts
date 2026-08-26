import type { RoomSnapshot } from '@/modules/multiplayer/types';
import { ROOM_SNAPSHOT_POLL_MS } from '../constants/query';

export function roomSnapshotRefetchInterval(
  poll: boolean,
  status: 'pending' | 'error' | 'success',
  phase: RoomSnapshot['phase'] | undefined,
): number | false {
  if (!poll || status === 'error') {
    return false;
  }
  if (phase !== undefined && phase !== 'waiting') {
    return false;
  }
  return ROOM_SNAPSHOT_POLL_MS;
}
