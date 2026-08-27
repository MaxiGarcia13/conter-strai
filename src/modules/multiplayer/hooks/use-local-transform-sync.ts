import { useFrame } from '@react-three/fiber';
import { getPlayerTransform } from '@/modules/game/state/player-state';
import { getActiveMatch, syncTransform } from '@/modules/multiplayer/adapters/colyseus-adapter';

/**
 * Streams the shared local player transform to the active match. Called every
 * frame; the adapter coalesces to the latest transform every ~20 Hz. No-op
 * outside a match so single-player play stays untouched.
 */
export function useLocalTransformSync(): void {
  useFrame(() => {
    if (!getActiveMatch()) {
      return;
    }
    const transform = getPlayerTransform();
    syncTransform({ x: transform.x, z: transform.z, yaw: transform.yaw });
  });
}
