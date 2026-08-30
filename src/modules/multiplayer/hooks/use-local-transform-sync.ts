import { useFrame } from '@react-three/fiber';
import { getPlayerTransform } from '@/modules/game/stores/player-state';
import { getActiveMatch, syncTransform } from '@/modules/multiplayer/adapters/colyseus-adapter';
import { flushLocalClipSync } from '@/modules/multiplayer/utils/sync-local-clip';

/**
 * Streams the shared local player transform to the active match. Called every
 * frame; the adapter coalesces to the latest transform every ~20 Hz. Relays the
 * resolved mixer clip (same `resolveAnimationClipKey` the local soldier uses)
 * on gait / pose changes so peers do not have to infer kneel-walk or backpedal.
 * Jump / reload also flush immediately from pose actions. No-op outside a match.
 */
export function useLocalTransformSync(): void {
  useFrame(() => {
    if (!getActiveMatch()) {
      return;
    }
    const transform = getPlayerTransform();
    syncTransform({ x: transform.x, z: transform.z, yaw: transform.yaw });
    flushLocalClipSync();
  });
}
