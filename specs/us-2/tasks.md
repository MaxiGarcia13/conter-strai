# US-2 — Tasks

Post type-split: use `SoldierSkin` / `soldier-skin-registry`, `ScenarioConfig` flat composition, and `collisionSegments` from `scenarios/types.ts`. See [`specs/current/design.md#module-types`](../current/design.md#module-types).

## Done

- [x] Texture registry (`forrest_ground`, `cliff_side`, … → `/assets/textures/maps/…`)
- [x] Prop registry stub (empty or placeholder ids; ready for trees later)
- [x] Scenario registry + `arena-01` **Ruined Village**: 100×50×3.5 m, floor/walls, **teamSpawns** (Puma west / Lion east), `props: []`
- [x] Soldier **skin** registry + `swat-guy` → `swat-soldier.glb` (`meshData` + `hitboxPresetId` → `humanoid-standard`)
- [x] `ScenarioScene`: floor + outer walls from config; generic `props` loop; texture repeat
- [x] Create `/play` page with dynamic `GameCanvas` import
- [x] `SoldierModel` component (spawn NPCs)
- [x] `useFpsControls` hook (WASD, mouse, **outer bounds** clamp only)
- [x] `FpsViewModel` (first-person arms rig on camera)
- [x] Soldier GLB clip mapping utilities (`idle`, `walk`, `run`; hips root motion stripped in code)
- [x] `useSoldierLocomotion` hook (mixer + crossfade; wired on `SoldierModel` → idle for NPCs)
- [x] Remove obsolete `swat-guy.glb` asset (superseded by `swat-soldier.glb`)
- [x] `vitest.config.ts` with `@/` → `src/` path alias
- [x] `soldier-skin-registry.test.ts` — `swat-guy` resolves URL, clips, `hitboxPresetId`
- [x] `scenario-registry.test.ts` — `arena-01` bounds, spawn sides, texture ids
- [x] `buildCollisionSegments` stub in `scenarios/pieces/collision-helpers.ts` (+ `collisionSegments` on `arena-01`)

## Camera modes

Cycle with **F**; HUD shows active mode. One local soldier clone — mode changes camera + rig placement only (no second model). Shared hot-path truth lives in `game/state/player-state.ts`; only `mode` is React-subscribable.

- [x] **First-person (FPS)** — camera at eye height (`PLAYER_EYE_HEIGHT` ~1.7 m); view model visible; immersion + precise aim
- [x] **Over-the-shoulder (OTS)** — close behind right shoulder (~1.75 m back, ~1.55 m up, shoulder offset); character visible
- [x] **Standard third-person (TPS)** — tracked behind and above (~3.6 m back, ~2.4 m up); full character + surroundings
- [x] Shared player transform state (`origin`, `yaw`, `pitch`, `mode`) consumed by controls + local soldier rig
- [x] `applyCameraMode` (or equivalent) positions Three.js camera per mode each frame
- [x] `CameraHud` overlay: `[F] Camera: …` label
- [x] Unified `LocalPlayer` (single clone + single mixer); FPS arms view model is mode-gated inside the rig (never on screen together with the body); NPC spawn-skip stays as slot reservation
- [x] Verify: mode cycle does not duplicate soldiers, teleport, or black-screen the canvas (e2e asserts constant `soldierCount` across cycles)

## Locomotion animations

Clips in `swat-soldier.glb`: `idle`, `walk`, `run` (see `soldier-skin-registry`). `dying` deferred to US-3.

Drive via `LocomotionState` / `LocomotionIntent` from `soldiers/types.ts` (controller abstraction).

- [x] Locomotion state: `idle` | `walk` | `run` driven by input each frame
- [x] **Idle** when not moving (no WASD)
- [x] **Walk** when moving with WASD (no Space)
- [x] **Run** when moving with WASD **and** Space held
- [x] Wire `useSoldierLocomotion` to local player with shared state from `useFpsControls`
- [x] Crossfade between clips (~0.2 s); in-place playback (hips translation stripped / locked)
- [x] Third-person modes: head + body visible; FPS: hide meshes that block the camera
- [x] `RUN_SPEED` constant (e.g. 9 m/s) distinct from `WALK_SPEED` (5 m/s) in `game/constants/player.ts`

## Interior wall collision

Today: player clamped to **outer arena bounds** only — can walk through house ruin walls. `collisionSegments` exist on `arena-01` but are not yet used by movement.

- [x] Increase default hole width (`WALL_HOLE_WIDTH` in `house-helpers`) so doorways are comfortably passable (~2.0–2.4 m)
- [x] Flesh out collision map: axis-aligned segments + doorway hole metadata (extend `buildCollisionSegments` if needed)
- [x] Player circle (`PLAYER_RADIUS`) vs wall segments: block solid spans; allow passage only through holes
- [x] Integrate into `useFpsControls` (or `resolvePlayerCollision` util) **after** intended move, before commit
- [x] Outer bounds clamp remains as final fallback
- [ ] Acceptance: cannot clip through ruin walls; can walk through holes; holes feel wider than 1.4 m default

## Testing — soldier render & locomotion

### Unit (Vitest)

- [x] `vitest.config.ts` + `@/` alias
- [x] `soldier-skin-registry.test.ts`
- [x] `scenario-registry.test.ts` (bounds + spawn sides + texture ids)
- [ ] `resolve-soldier-clips.test.ts` — registry names resolve; `null` when a clip is missing
- [ ] `strip-root-motion.test.ts` — hips translation tracks removed from walk/run clips
- [ ] `swat-soldier-glb.test.ts` — **asset contract** (parse GLB JSON chunk):
  - clips: `idle`, `walk`, `run` (and `dying` present but optional)
  - nodes: `Armature`, `Soldier_body`, `Soldier_head`
  - bones: `mixamorig:Hips`, neck, hands (no PropertyBinding orphans vs idle channels)
- [ ] `locomotion-state.test.ts` — pure fn: stand → `idle`, WASD → `walk`, WASD+Space → `run`
- [ ] Collision segment + hole math tests (when collision util is complete)

### E2E (Playwright)

- [x] `tests/e2e/play.spec.ts` — `/play` loads: `<canvas>` visible, boot/deploy loader dismissed, no `PropertyBinding` console errors
- [x] Optional dev hook `window.__PLAY_TEST__` (`soldierCount`, `mixerReady`, `activeClip`) when `E2E=true`
- [x] E2E asserts hook: at least one soldier in scene after load; mixer ready; clip is `idle` at spawn

### Acceptance

- `npm run test:unit` fails if GLB clips/registry drift or hips strip breaks
- `npm run test:e2e` fails if `/play` canvas does not load or soldier/mixer hook regresses

## Later / other US

- [ ] `dying` animation hook-up (clip in GLB; wire on damage — US-3)
- [ ] Crosshair HUD overlay (US-2.7 / US-4)
