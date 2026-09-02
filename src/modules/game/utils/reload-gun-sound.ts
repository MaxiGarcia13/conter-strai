import {
  RELOAD_CLIP_SECONDS,
  RELOAD_SOUND_BEFORE_END_SECONDS,
} from '../constants/reload';
import { playStoppableGameSound } from './play-game-sound';

let scheduledTimeout: ReturnType<typeof setTimeout> | null = null;
let activePlayback: { stop: () => void } | null = null;

/** Schedules reload SFX near the end of the reload animation. */
export function scheduleReloadGunSound(): void {
  stopReloadGunSound();
  const delayMs = (RELOAD_CLIP_SECONDS - RELOAD_SOUND_BEFORE_END_SECONDS) * 1000;
  scheduledTimeout = setTimeout(() => {
    scheduledTimeout = null;
    activePlayback = playStoppableGameSound('reloadingGun');
  }, delayMs);
}

/** Cancels pending reload SFX and stops any active playback (e.g. WASD cancel). */
export function stopReloadGunSound(): void {
  if (scheduledTimeout) {
    clearTimeout(scheduledTimeout);
    scheduledTimeout = null;
  }
  activePlayback?.stop();
  activePlayback = null;
}

/** Test helper — clears pending/active reload gun audio. */
export function resetReloadGunSoundForTests(): void {
  stopReloadGunSound();
}
