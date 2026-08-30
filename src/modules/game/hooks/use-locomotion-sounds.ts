import type { LocomotionSoundId } from '../utils/resolve-locomotion-sound';
import { useFrame } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import { useHealthStore } from '@/modules/combat';
import { LOCOMOTION_SOUND_GAIN, LOCOMOTION_SOUND_URLS } from '../constants/locomotion-sounds';
import { LOCAL_PLAYER_ENTITY_ID } from '../constants/player';
import { getPlayerLocomotion, getPlayerPose } from '../stores/player-state';
import { resolveLocomotionSound } from '../utils/resolve-locomotion-sound';

function createLoop(url: string): HTMLAudioElement {
  const audio = new Audio(url);
  audio.loop = true;
  audio.preload = 'auto';
  return audio;
}

/** Loops walk/run movement SFX while the local player is moving on the ground. */
export function useLocomotionSounds(): void {
  const loopsRef = useRef<Record<LocomotionSoundId, HTMLAudioElement> | null>(null);
  const activeRef = useRef<LocomotionSoundId | null>(null);

  useEffect(() => {
    const loops = {
      walk: createLoop(LOCOMOTION_SOUND_URLS.walk),
      run: createLoop(LOCOMOTION_SOUND_URLS.run),
    };
    loopsRef.current = loops;
    return () => {
      for (const audio of Object.values(loops)) {
        audio.pause();
      }
      loopsRef.current = null;
      activeRef.current = null;
    };
  }, []);

  useFrame(() => {
    const loops = loopsRef.current;
    if (!loops) {
      return;
    }

    const eliminated = useHealthStore.getState().healthById[LOCAL_PLAYER_ENTITY_ID]?.isEliminated;
    const target = eliminated
      ? null
      : resolveLocomotionSound(getPlayerLocomotion(), getPlayerPose());

    if (target === activeRef.current) {
      if (target && loops[target].paused) {
        const audio = loops[target];
        audio.volume = LOCOMOTION_SOUND_GAIN[target];
        void audio.play().catch(() => {});
      }
      return;
    }

    if (activeRef.current) {
      const previous = loops[activeRef.current];
      previous.pause();
      previous.currentTime = 0;
    }
    activeRef.current = target;

    if (target) {
      const audio = loops[target];
      audio.volume = LOCOMOTION_SOUND_GAIN[target];
      void audio.play().catch(() => {});
    }
  });
}
