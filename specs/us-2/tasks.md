# US-2 — Tasks

## Done

- [x] Texture registry (`forrest_ground`, `cliff_side`, … → `/assets/textures/maps/…`)
- [x] Prop registry stub (empty or placeholder ids; ready for trees later)
- [x] Scenario registry + `arena-01` **Ruined Village**: 100×50×3.5 m, floor/walls, **teamSpawns** (Puma west / Lion east), `props: []`
- [x] Soldier registry + `swat-guy` definition → `swat-soldier.glb`
- [x] `ScenarioScene`: floor + outer walls from config; generic `props` loop; texture repeat
- [x] Create `/play` page with dynamic `GameCanvas` import
- [x] `SoldierModel` component (spawn NPCs)
- [x] `useFpsControls` hook (WASD, mouse, **outer bounds** clamp only)
- [x] `FpsViewModel` (first-person arms rig on camera)
- [x] Soldier GLB clip mapping utilities (`idle`, `walk`, `run`; hips root motion stripped in code)
- [x] `useSoldierLocomotion` hook (mixer + crossfade; wired on `SoldierModel` → idle for NPCs)
- [x] Remove obsolete `swat-guy.glb` asset (superseded by `swat-soldier.glb`)

## Camera modes

Cycle with **F**; HUD shows active mode. One local soldier clone — mode changes camera + rig placement only (no second model).

- [ ] **First-person (FPS)** — camera at eye height (~1.7 m); view model visible (arms/body per FPS prep); immersion + precise aim (CoD / DOOM style)
- [ ] **Over-the-shoulder (OTS)** — close behind right shoulder (~1.75 m back, ~1.55 m up, shoulder offset); character visible; good for cover + ADS feel (RE4 / Gears style)
- [ ] **Standard third-person (TPS)** — tracked behind and above (~3.6 m back, ~2.4 m up); full character + surroundings visible (Fortnite / Helldivers style)
- [ ] Shared player transform state (`origin`, `yaw`, `pitch`, `mode`) consumed by controls + local soldier rig
- [ ] `applyCameraMode` (or equivalent) positions Three.js camera per mode each frame
- [ ] `CameraHud` overlay: `[F] Camera: …` label
- [ ] Unified `LocalPlayer` (single clone + single mixer); retire duplicate `FpsViewModel` + spawn-skip soldier once local rig is stable
- [ ] Verify: mode cycle does not duplicate soldiers, teleport, or black-screen the canvas

## Locomotion animations

Clips in `swat-soldier.glb`: `idle`, `walk`, `run` (see soldier registry). `dying` deferred to US-3.

- [ ] Locomotion state: `idle` | `walk` | `run` driven by input each frame
- [ ] **Idle** when not moving (no WASD)
- [ ] **Walk** when moving with WASD (no Space)
- [ ] **Run** when moving with WASD **and** Space held
- [ ] Wire `useSoldierLocomotion` to local player with `followPlayerInput` (or equivalent shared state from `useFpsControls`)
- [ ] Crossfade between clips (~0.2 s); in-place playback (hips translation stripped / locked — no root-motion teleport)
- [ ] Third-person modes: head + body visible; FPS: hide meshes that block the camera (no backface-cull black screen)
- [ ] `RUN_SPEED` constant (e.g. 9 m/s) distinct from `WALK_SPEED` (5 m/s)

## Interior wall collision

Today: player clamped to **outer arena bounds** only — can walk through house ruin walls. Holes exist in layout data but are visual gaps only.

- [ ] Increase default hole width (`WALL_HOLE_WIDTH`) so doorways are comfortably passable (target ~2.0–2.4 m; tune in `house-helpers`)
- [ ] Build a **collision map** from `arena-01` `wallSegments` (axis-aligned segments + gap metadata per house side)
- [ ] Player circle (`PLAYER_RADIUS`) vs wall segments: block movement through solid spans; allow passage only through configured holes
- [ ] Integrate collision into `useFpsControls` (or a dedicated `resolvePlayerCollision` util) **after** intended move, before commit
- [ ] Outer bounds clamp remains as final fallback
- [ ] Acceptance: cannot clip through ruin walls; can walk through holes; holes feel wider than current 1.4 m default

## Testing — soldier render & locomotion animations

### Unit (Vitest)

- [ ] Add `vitest.config.ts` with `@/` → `src/` path alias
- [ ] `soldier-registry.test.ts` — `swat-guy` resolves URL, scale, and `idle` / `walk` / `run` clip names
- [ ] `resolve-soldier-clips.test.ts` — registry names resolve; returns `null` when a clip is missing
- [ ] `strip-root-motion.test.ts` — hips translation tracks removed from walk/run clips
- [ ] `swat-soldier-glb.test.ts` — **asset contract** (parse GLB JSON chunk):
  - clips: `idle`, `walk`, `run` (and `dying` present but optional)
  - nodes: `Armature`, `Soldier_body`, `Soldier_head`
  - bones: `mixamorig:Hips`, neck, hands (no PropertyBinding orphans vs idle channels)
- [ ] `locomotion-state.test.ts` — pure fn: stand → `idle`, WASD → `walk`, WASD+Space → `run` (when input helper exists)
- [ ] Scenario registry tests: texture ids, `arena-01` bounds + spawn sides; collision segment + hole math (when collision util exists)

### E2E (Playwright)

- [ ] `tests/e2e/play.spec.ts` — `/play` loads: `<canvas>` visible, boot/deploy loader dismissed, no `PropertyBinding` console errors
- [ ] Optional dev hook `window.__PLAY_TEST__` (`soldierCount`, `mixerReady`, `activeClip`) exposed when `E2E=true`
- [ ] E2E asserts hook: at least one soldier in scene after load; mixer ready; clip is `idle` at spawn

### Acceptance

- `npm run test:unit` fails if GLB clips/registry drift or hips strip breaks
- `npm run test:e2e` fails if `/play` canvas does not load or soldier/mixer hook regresses

## Later / other US

- [ ] `dying` animation hook-up (clip in GLB; wire on damage — US-3)
- [ ] Crosshair HUD overlay (US-2.7)
