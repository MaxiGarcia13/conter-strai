import type { LocomotionSoundLoops } from '../utils/locomotion-sound-loops';
import { useFrame } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import { useHealthStore } from '@/modules/combat';
import { LOCOMOTION_SOUND_GAIN } from '../constants/locomotion-sounds';
import { LOCAL_PLAYER_ENTITY_ID } from '../constants/player';
import { getPlayerLocomotion, getPlayerPose } from '../stores/player-state';
import { createLocomotionSoundLoops } from '../utils/locomotion-sound-loops';
import { resolveLocomotionSound } from '../utils/resolve-locomotion-sound';

/** Loops walk/run movement SFX while the local player is moving on the ground. */
export function useLocomotionSounds(): void {
  const loopsRef = useRef<LocomotionSoundLoops | null>(null);

  useEffect(() => {
    const loops = createLocomotionSoundLoops();
    loopsRef.current = loops;
    return () => {
      loops.dispose();
      loopsRef.current = null;
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

    loops.setActive(target, target ? LOCOMOTION_SOUND_GAIN[target] : 0);
  });
}
