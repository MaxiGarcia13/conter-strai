import type { HitboxPresetId } from '@/modules/combat';
import type { Team } from '@/modules/teams';

// ---------------------------------------------------------------------------
// Skin
// ---------------------------------------------------------------------------

/** GLB animation clip names — must match names embedded in the soldier GLB. */
export interface SoldierAnimationClips {
  idle: string;
  walk: string;
  run: string;
  jump: string;
  kneel: string;
  reloading: string;
  shooting: string;
}

/** Action poses layered above locomotion; `reloading` / `shooting` join with US-4. */
export type SoldierActionId = 'jump' | 'kneel';

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

// ---------------------------------------------------------------------------
// Controller
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Entity
// ---------------------------------------------------------------------------

/** Runtime entity identifier (Colyseus session id once networking lands). */
export type EntityId = string;

export interface Soldier {
  id: EntityId;
  team: Team;
  skinId: SoldierSkinId;
}
