export type LocomotionState = 'idle' | 'walk' | 'run';

/** Per-frame movement request produced by a controller. */
export interface LocomotionIntent {
  /** Planar world-space direction (Y ignored); zero vector means stand still. */
  moveDirection: [number, number, number];
  running: boolean;
}

export interface SoldierController {
  /** Movement intent for the current frame. */
  getIntent: () => LocomotionIntent;
}

/** Human input source; future AI controllers implement `SoldierController` directly. */
export type PlayerController = SoldierController;
