/** Merged per-frame movement intent consumed by the movement pipeline (keyboard OR touch). */
export interface PlayerFrameIntent {
  strafe: -1 | 0 | 1;
  forward: -1 | 0 | 1;
  running: boolean;
}

/** Discrete gameplay actions produced by an input provider. */
export type GameAction = 'kneelToggle' | 'sprint' | 'shoot' | 'pause';
