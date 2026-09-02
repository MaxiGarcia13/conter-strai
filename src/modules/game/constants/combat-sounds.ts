/** Beyond this range (meters) combat SFX play at `COMBAT_SOUND_MIN_VOLUME`. */
export const COMBAT_SOUND_MAX_DISTANCE = 30;

/** Floor volume for distant combat SFX (0–1). */
export const COMBAT_SOUND_MIN_VOLUME = 0.05;

/** Per-sound gain multipliers applied after spatial falloff (0–1). */
export const GAME_SOUND_GAIN = {
  pistol: 0.5,
  ouch: 0.5,
  emptyGun: 0.5,
  reloadingGun: 0.5,
} as const;
