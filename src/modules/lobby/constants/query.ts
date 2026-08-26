export const ROOM_SNAPSHOT_POLL_MS = 2000;

export function roomSnapshotQueryKey(roomId: string) {
  return ['room', roomId] as const;
}
