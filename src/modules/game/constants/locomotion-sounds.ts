/** Looping footstep / movement SFX for local locomotion (0–1). */
export const LOCOMOTION_SOUND_GAIN = {
  walk: 0.45,
  run: 0.5,
} as const;

/** Beyond this range (meters) locomotion SFX play at `LOCOMOTION_SOUND_MIN_VOLUME`. */
export const LOCOMOTION_SOUND_MAX_DISTANCE = 40;

/** Floor volume for distant locomotion SFX (0–1). */
export const LOCOMOTION_SOUND_MIN_VOLUME = 0.05;

export const LOCOMOTION_SOUND_URLS = {
  walk: '/assets/characters/sounds/walk.m4a',
  run: '/assets/characters/sounds/run.m4a',
} as const;
