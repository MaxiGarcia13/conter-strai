# US-2 — Design

## Units

1 world unit = **1 meter**. Movement, collision, and map sizes use meters everywhere.

## Registries

Maps stay data-driven so future arenas (and props like trees) are config-only, not new React scenes.

| Registry     | Role                                               | Example ids                         |
| ------------ | -------------------------------------------------- | ----------------------------------- |
| **Texture**  | Floor/wall GLB materials under `/assets/textures/` | `forrest_ground`, `coral_fort_wall` |
| **Prop**     | Placeable objects (trees, barrels, cover)          | `tree` (later)                      |
| **Scenario** | Map layout: bounds, materials, props, team spawns  | `arena-01`                          |
| **Soldier skin** | Visual presets (`SoldierSkin`); hitbox via `hitboxPresetId` | `swat-guy`                   |

## Registry types

```typescript
type Team = 'puma' | 'lion';
type Vec3 = [number, number, number];

interface TextureDefinition {
  id: string;
  url: string; // e.g. /assets/textures/floor/forrest_ground.glb
}

interface PropDefinition {
  id: string;
  modelUrl: string;
  scale?: number;
  collidable?: boolean; // default false for decor
}

interface ScenarioProp {
  id: string; // looks up prop registry
  position: Vec3;
  rotationY?: number;
  scale?: number;
  collidable?: boolean; // overrides definition default
}

interface ScenarioConfig {
  id: string;
  name: string;
  theme?: string;
  bounds: { width: number; depth: number; wallHeight: number };
  floor: { assetId: string; repeat?: [number, number] };
  walls: { assetId: string; thickness?: number };
  /** Optional interior ruin stubs (cover); outer box comes from bounds */
  wallSegments?: { start: Vec3; end: Vec3; height?: number }[];
  props?: ScenarioProp[];
  teamSpawns: Record<Team, Vec3[]>;
  /** Optional spawn yaw (radians); omit = face map center */
  spawnYaw?: Record<Team, number>;
  lighting?: { ambient: number; sunIntensity: number };
}

interface SoldierSkin {
  meshData: CharacterMeshData; // modelUrl, scale, viewModelScale?, animations
  hitboxPresetId: HitboxPresetId; // owned by combat/ — not mesh-bound
}
```

New arena = new `ScenarioConfig` entry. New tree/object = prop registry entry + placements in `props[]`. `ScenarioScene` only reads config. Type layout: [`specs/current/design.md#module-types`](../current/design.md#module-types).

## Components

- `GameCanvas.tsx` — R3F Canvas, lights (from scenario or defaults), camera
- `ScenarioScene.tsx` — floor + outer walls + optional `wallSegments` + generic `props` render
- `SoldierModel.tsx` — loads `swat-soldier.glb` (soldier id `swat-guy`); NPC spawns
- `LocalPlayer.tsx` — one clone + mixer; FPS hides head/neck; look pitch applied to spine so arms follow mouse
- `useFpsControls.ts` — WASD, mouse, locomotion state, collision (bounds + interior walls)
- `useSoldierLocomotion.ts` — idle / walk / run + action clips (jump, kneel, …) on skinned root
- `CameraHud.tsx` — active camera mode label
- `CrosshairHud.tsx` — centered DOM crosshair (US-2.7)
- World aim marker — look-ray hit reticle in the canvas (US-2.19)

## Camera modes (C to cycle)

| Mode | Role | Tunables (m) |
| ---- | ---- | ------------ |
| **First-person** | Camera on head bone; head mesh hidden; arms from the same clone, pitched with look; HUD crosshair + look-ray marker | head world pos, spine pitch |
| **Over-the-shoulder** | Close behind one shoulder; character + aim context visible | distance ~1.75, height ~1.55, shoulder offset ~0.42 |
| **Third-person** | Farther behind and above; max situational awareness | distance ~3.6, height ~2.4, pitch scale on look |

Shared state: ground `origin` [x, 0, z], `yaw`, `pitch`, `mode`. Camera positioned each frame from mode + origin — not by moving the soldier root independently in third person.

**FPS (one mesh):** after the mixer, place the camera at the head bone’s world position (not a fixed `PLAYER_EYE_HEIGHT` clip hack). Scale Head (and Neck if needed) to zero so the camera is not inside the helmet. Apply look pitch to spine/upper-body bones so arms follow the mouse; rig yaw stays as today. No second clone / `FpsViewModel`. `prepareFpsViewModel` (legs + head on a camera child) is unused.

**Aim:** screen-center crosshair (camera look) plus a world marker at the first scene hit along that ray, excluding local player meshes.

## Locomotion / action animations

| Input | Clip | Notes |
| ----- | ---- | ----- |
| Stand still | `idle` | Default |
| WASD | `walk` | In-place; hips root motion stripped in code |
| WASD + Space | `run` | Faster move speed + run clip |
| **F** | `jump` | One-shot; animation-only (no vertical physics) |
| **E** | `kneel` | Toggle; `LoopOnce` + clamp; cancel on WASD |

Priority (high → low): blocking one-shots (`reloading` / `jump` / `shooting` from US-4) → `kneel` → locomotion. One `AnimationMixer` on the local clone. Scenario NPCs stay on `idle` until US-4+.

**Hips tracks:** locomotion clips play in place (hips translation stripped); action clips keep their hips translation so the body visibly crouches (`kneel`) and leaves the ground (`jump`).

## Interior wall collision

- **Visual**: `wallSegments` from `arena-01/layout.ts` (house footprints + holes via `WALL_HOLE_WIDTH`).
- **Collision**: derive axis-aligned blocking segments from the same config; subtract centered **hole** spans on sides marked `{ hole: width }`.
- **Player**: circle cast / clamp with `PLAYER_RADIUS` (~0.4 m). Resolve after intended WASD step; outer bounds clamp last.
- **Holes**: widen default gap (currently 1.4 m) so passage feels intentional, not tight.

## Testing

| Layer | Scope |
| ----- | ----- |
| **Vitest** | Registry lookup; `resolveSoldierClips` / `stripHipsTranslation`; GLB JSON contract on `swat-soldier.glb`; FPS head/neck hide helper; pure locomotion state fn; scenario/collision math when added |
| **Playwright** | `/play` canvas visible, loader dismissed, no `PropertyBinding` console errors; crosshair overlay; optional `window.__PLAY_TEST__` hook for soldier count + mixer + active clip |

Unit tests avoid WebGL; E2E does not rely on pixel assertions.

## arena-01 — Ruined Village

Abandoned village: only walls remain (no roofs / interiors). Long street layout for pistol TDM.

| Field            | Value                                                                                                                      |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------- |
| **id**           | `arena-01`                                                                                                                 |
| **name**         | Ruined Village                                                                                                             |
| **theme**        | `ruined-village`                                                                                                           |
| **bounds**       | **100 m** width (X) × **50 m** depth (Z); wall height **3.5 m**                                                            |
| **floor**        | `forrest_ground` (`/assets/textures/floor/forrest_ground.glb`) — outdoor ground; set `repeat` so tiling holds at this size |
| **walls**        | `coral_fort_wall` (`/assets/textures/wall/coral_fort_wall.glb`) — stone ruin perimeter                                     |
| **props (US-2)** | Empty array or omit — slots ready for trees / cover later                                                                  |
| **lighting**     | Soft daylight (ambient + sun); mood can differ per arena later                                                             |

| Team | Spawn side | Points           | Facing                 |
| ---- | ---------- | ---------------- | ---------------------- |
| Puma | West (−X)  | ≥2 near west end | Toward +X (map center) |
| Lion | East (+X)  | ≥2 near east end | Toward −X (map center) |

Spawns stay clear of walls (~2 m inset). Round start (US-4) picks one spawn per player on their team.

### Out of scope for US-2

Navmesh, destructible walls, multi-level, roofs, LODs, prop models (trees etc. land via config when assets exist).

## Module layout

```
src/modules/
├── game/       GameCanvas, LocalPlayer, CrosshairHud, useFpsControls, CameraHud, RoundPhase types
├── scenarios/  types.ts + registry, ScenarioScene, arena-01, collisionSegments
├── soldiers/   types.ts + soldier-skin-registry, SoldierModel, useSoldierLocomotion
├── combat/     HitboxPreset registry (US-3 meshes); types only for US-2 consumers
├── weapons/    pistol types + registry (wired in US-4)
├── textures/   types.ts + registry
├── props/      types.ts + registry
└── teams/      Team = 'puma' | 'lion'
```
