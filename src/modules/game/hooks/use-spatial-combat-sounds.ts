import type { Scene } from 'three';
import { useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import { DEFAULT_MAX_HP } from '@/modules/combat/constants/health';
import { useHealthStore } from '@/modules/combat/health-store';
import { playEntityGameSound } from '../utils/play-game-sound';

function collectDamagedEntityIds(
  prevById: Record<string, { currentHp: number } | undefined>,
  nextById: Record<string, { currentHp: number } | undefined>,
): string[] {
  const ids = new Set([...Object.keys(prevById), ...Object.keys(nextById)]);
  const damaged: string[] = [];
  for (const entityId of ids) {
    const prevHp = prevById[entityId]?.currentHp;
    const nextHp = nextById[entityId]?.currentHp;
    if (nextHp === undefined) {
      continue;
    }
    const baselineHp = prevHp ?? DEFAULT_MAX_HP;
    if (nextHp < baselineHp) {
      damaged.push(entityId);
    }
  }
  return damaged;
}

/** Plays distance-attenuated injury SFX for every soldier that takes damage. */
export function useSpatialCombatSounds(): void {
  const scene = useThree((s) => s.scene);
  const listener = useThree((s) => s.camera);
  const sceneRef = useRef<Scene>(scene);
  sceneRef.current = scene;

  useEffect(() => {
    return useHealthStore.subscribe((state, prevState) => {
      const damagedIds = collectDamagedEntityIds(prevState.healthById, state.healthById);
      for (const entityId of damagedIds) {
        playEntityGameSound('ouch', entityId, sceneRef.current, listener.position);
      }
    });
  }, [listener]);
}
