/** GLB animation clip names — must match names embedded in the soldier GLB. */
export interface SoldierAnimationClips {
  idle: string;
  walk: string;
  run: string;
}

export interface SoldierDefinition {
  id: string;
  modelUrl: string;
  /** Multiplier on the GLB armature scale (swat-soldier embeds 0.01 → ~1.7 m at 1). */
  scale: number;
  /** First-person scale multiplier; defaults to `scale` when omitted. */
  viewModelScale?: number;
  /** Idle / walk clip names inside the GLB. */
  animations: SoldierAnimationClips;
}

export type SoldierId = 'swat-guy';

export type LocomotionState = 'idle' | 'walk' | 'run';
