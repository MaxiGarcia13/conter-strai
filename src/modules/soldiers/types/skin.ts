import type { HitboxPresetId } from './hitbox';

/** GLB animation clip names — must match names embedded in the soldier GLB. */
export interface SoldierAnimationClips {
  idle: string;
  walk: string;
  run: string;
}

/** Shared GLB descriptor for world models and the first-person view model. */
export interface CharacterMeshData {
  modelUrl: string;
  /** Multiplier on the GLB armature scale (swat-soldier embeds 0.01 → ~1.7 m at 1). */
  scale: number;
  /** First-person scale multiplier; defaults to `scale` when omitted. */
  viewModelScale?: number;
  animations: SoldierAnimationClips;
}

export type SoldierSkinId = 'swat-guy';

/** Visual preset; collider layout stays decoupled via `hitboxPresetId`. */
export interface SoldierSkin {
  meshData: CharacterMeshData;
  hitboxPresetId: HitboxPresetId;
}
