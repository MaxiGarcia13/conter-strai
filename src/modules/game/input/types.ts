/** Merged per-frame movement intent consumed by the movement pipeline (keyboard OR touch). */
export interface PlayerFrameIntent {
  strafe: number;
  forward: number;
  running: boolean;
}

/** Discrete gameplay actions produced by an input provider. */
export type GameAction = 'kneelToggle' | 'sprint' | 'shoot' | 'pause';
