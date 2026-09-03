import type { Scene } from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import { drainDueInjurySounds } from '@/modules/combat/injury-sound-events';
import { getActiveMatch } from '@/modules/multiplayer/adapters/colyseus-adapter';
import { useMultiplayerStore } from '@/modules/multiplayer/stores/multiplayer-store';
import { playEntityGameSound } from '../utils/play-game-sound';
import { playInjurySound } from '../utils/play-injury-sound';

/** Plays distance-attenuated combat SFX for local and remote soldiers. */
export function useSpatialCombatSounds(): void {
  const scene = useThree((s) => s.scene);
  const listener = useThree((s) => s.camera);
  const connected = useMultiplayerStore((s) => s.connected);
  const sceneRef = useRef<Scene>(scene);
  sceneRef.current = scene;

  useFrame(() => {
    for (const entityId of drainDueInjurySounds()) {
      playInjurySound(entityId, sceneRef.current, listener.position);
    }
  });

  useEffect(() => {
    const match = getActiveMatch();
    if (!match || !connected) {
      return;
    }
    return match.onFire(({ sessionId }) => {
      playEntityGameSound('pistol', sessionId, sceneRef.current, listener.position);
    });
  }, [connected, listener]);
}
