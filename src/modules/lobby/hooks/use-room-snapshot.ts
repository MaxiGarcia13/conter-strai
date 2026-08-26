import { useQuery } from '@tanstack/react-query';
import { getRoomSnapshot } from '@/modules/multiplayer/services/get-room-snapshot';
import { roomSnapshotQueryKey } from '../constants/query';
import { roomSnapshotRefetchInterval } from '../utils/room-snapshot-refetch-interval';

interface UseRoomSnapshotOptions {
  poll?: boolean;
}

export function useRoomSnapshot(roomId: string, options: UseRoomSnapshotOptions = {}) {
  const poll = options.poll ?? false;
  return useQuery({
    queryKey: roomSnapshotQueryKey(roomId),
    queryFn: () => getRoomSnapshot(roomId),
    enabled: Boolean(roomId),
    refetchInterval: (query) =>
      roomSnapshotRefetchInterval(poll, query.state.status, query.state.data?.phase),
  });
}
