import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { getPlayerPose, getPlayerTransform } from '@/modules/game/state/player-state';
import { getActiveMatch, sendPose, syncTransform } from '@/modules/multiplayer/adapters/colyseus-adapter';
import { toRemotePoseMessage } from '@/modules/multiplayer/utils/syncable-remote-pose';

/**
 * Streams the shared local player transform to the active match. Called every
 * frame; the adapter coalesces to the latest transform every ~20 Hz. Also
 * relays pose changes once per transition so peers can play cosmetic actions.
 * No-op outside a match so single-player play stays untouched.
 */
export function useLocalTransformSync(): void {
  const lastSyncPoseRef = useRef<ReturnType<typeof toRemotePoseMessage> | null>(null);

  useFrame(() => {
    if (!getActiveMatch()) {
      return;
    }
    const transform = getPlayerTransform();
    syncTransform({ x: transform.x, z: transform.z, yaw: transform.yaw });

    const syncPose = toRemotePoseMessage(getPlayerPose());
    if (syncPose !== lastSyncPoseRef.current) {
      lastSyncPoseRef.current = syncPose;
      sendPose(syncPose);
    }
  });
}
