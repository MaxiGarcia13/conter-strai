import type { Scene } from 'three';
import { useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import { useHealthStore } from '@/modules/combat/health-store';
import { getActiveMatch } from '@/modules/multiplayer/adapters/colyseus-adapter';
import { useMultiplayerStore } from '@/modules/multiplayer/stores/multiplayer-store';
import { collectHpDroppedIds } from '../utils/collect-hp-dropped-ids';
import { playEntityGameSound } from '../utils/play-game-sound';

function toHpById(
  remotePlayers: Record<string, { health: { currentHp: number } } | undefined>,
): Record<string, { currentHp: number }> {
  const byId: Record<string, { currentHp: number }> = {};
  for (const [entityId, entry] of Object.entries(remotePlayers)) {
    if (entry) {
      byId[entityId] = { currentHp: entry.health.currentHp };
    }
  }
  return byId;
}

/** Plays distance-attenuated combat SFX for local and remote soldiers. */
export function useSpatialCombatSounds(): void {
  const scene = useThree((s) => s.scene);
  const listener = useThree((s) => s.camera);
  const connected = useMultiplayerStore((s) => s.connected);
  const sceneRef = useRef<Scene>(scene);
  sceneRef.current = scene;

  useEffect(() => {
    return useHealthStore.subscribe((state, prevState) => {
      const damagedIds = collectHpDroppedIds(prevState.healthById, state.healthById);
      for (const entityId of damagedIds) {
        playEntityGameSound('ouch', entityId, sceneRef.current, listener.position);
      }
    });
  }, [listener]);

  useEffect(() => {
    return useMultiplayerStore.subscribe((state, prevState) => {
      const damagedIds = collectHpDroppedIds(
        toHpById(prevState.remotePlayers),
        toHpById(state.remotePlayers),
      );
      for (const entityId of damagedIds) {
        playEntityGameSound('ouch', entityId, sceneRef.current, listener.position);
      }
    });
  }, [listener]);

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
