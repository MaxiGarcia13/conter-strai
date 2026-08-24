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
- [x] Soldier GLB clip mapping utilities (`idle`, `walk`, `run`; hips root motion stripped in code)
- [x] `useSoldierLocomotion` hook (mixer + crossfade; wired on `SoldierModel` → idle for NPCs)
- [x] Remove obsolete `swat-guy.glb` asset (superseded by `swat-soldier.glb`)
- [x] `vitest.config.ts` with `@/` → `src/` path alias
- [x] `soldier-skin-registry.test.ts` — `swat-guy` resolves URL, clips, `hitboxPresetId`
- [x] `scenario-registry.test.ts` — `arena-01` bounds, spawn sides, texture ids
- [x] `buildCollisionSegments` stub in `scenarios/pieces/collision-helpers.ts` (+ `collisionSegments` on `arena-01`)

## Camera modes

Cycle with **C**. HUD shows active mode. One local soldier clone + mixer (`LocalPlayer`). FPS places the camera on the **head bone** (no second clone / `FpsViewModel`). Shared hot-path truth lives in `game/state/player-state.ts`; only `mode` is React-subscribable.

- [x] **First-person (FPS)** — camera at eye height (`PLAYER_EYE_HEIGHT` ~1.7 m)
- [x] **Over-the-shoulder (OTS)** — close behind right shoulder (~1.75 m back, ~1.55 m up, shoulder offset); character visible
- [x] **Standard third-person (TPS)** — tracked behind and above (~3.6 m back, ~2.4 m up); full character + surroundings
- [x] Shared player transform state (`origin`, `yaw`, `pitch`, `mode`) consumed by controls + local soldier rig
- [x] `applyCameraMode` (or equivalent) positions Three.js camera per mode each frame
- [x] `CameraHud` overlay: `[C] Camera: …` label
- [x] Unified `LocalPlayer` (world clone + mixer); NPC spawn-skip stays as slot reservation
- [x] Verify: mode cycle does not duplicate soldiers, teleport, or black-screen the canvas (e2e asserts constant `soldierCount` across cycles)

## FPS head camera + aim HUD

One mesh. Do not add a camera-parented `FpsViewModel`. Camera follows the local soldier **head bone** after the mixer; hide head (and usually neck) so the camera is not inside the skull. Arms stay on the world body — apply look **pitch** to spine/upper-body bones so arms follow the mouse. Aim = camera look (US-2.7 screen crosshair + US-2.19 world hit marker).

- [x] Resolve Mixamo head bone on the local clone (`mixamorigHead` / `mixamorig:Head`); document names in the skin/asset contract
- [x] FPS: after locomotion mixer update, copy head **world** position to the camera (tiny look-forward offset optional); look rotation stays `pitch`/`yaw` from player state
- [x] Frame order: mixer → `updateWorldMatrix` on head → place camera (avoid one-frame lag)
- [x] FPS: scale/hide Head (and Neck if needed) so the camera does not see the inside of the helmet; restore scale in OTS/TPS (Neck intentionally kept — hiding it collapses the head anchor; clips rewrite scale per frame so hide is enforced post-mixer)
- [x] Apply mouse pitch to upper-body / spine bones after the clip so arms follow look; yaw stays on the rig as today
- [ ] If look-down still clips chest, hide additional FPS-only meshes (upper chest) — do not hide the whole body
- [x] OTS/TPS: keep `placeShoulderCamera`; show full head/body; do not apply FPS-only bone hides
- [x] HUD crosshair (US-2.7): centered DOM overlay, `pointer-events-none`, all camera modes, `aria-hidden`, `data-testid` for e2e
- [x] World aim marker (US-2.19): raycast along camera look; small reticle at hit; skip local-player meshes; hide when no hit
- [x] Cycle C: head visible again in OTS/TPS; FPS shows arms, not torso interior; still one local clone

## Locomotion animations

Clips in `swat-soldier.glb`: `idle`, `walk`, `run` (see `soldier-skin-registry`). `dying` deferred to US-3.

Drive via pose state / `LocomotionIntent` from `soldiers/types.ts` (controller abstraction).

- [x] Locomotion state: `idle` | `walk` | `run` driven by input each frame
- [x] **Idle** when not moving (no WASD)
- [x] **Walk** when moving with WASD (no Space)
- [x] **Run** when moving with WASD **and** Space held
- [x] Wire `useSoldierLocomotion` to local player with shared state from `useFpsControls`
- [x] Crossfade between clips (~0.2 s); in-place playback (hips translation stripped / locked)
- [x] Third-person modes: full head + body; FPS: same clone, head/neck hidden, arms visible and pitched with look
- [x] `RUN_SPEED` constant (e.g. 9 m/s) distinct from `WALK_SPEED` (5 m/s) in `game/constants/player.ts`

## Action animations (jump / kneel)

Registry also maps `jump`, `kneel` (plus US-4 `reloading` / `shooting`). Camera cycle is **C**; **F** is jump.

- [x] Extend `SoldierAnimationClips` + registry + `resolveSoldierClips` for action clips
- [x] Pose state includes `jump` | `kneel` (and US-4 action clips); priority over locomotion
- [x] **F** → one-shot `jump` (busy until mixer finished); no Y physics
- [x] **E** → toggle `kneel` (`LoopOnce` + clamp); cancel on WASD
- [x] Remap camera cycle **F** → **C**; update HUD + e2e

## Interior wall collision

Today: player clamped to **outer arena bounds** only — can walk through house ruin walls. `collisionSegments` exist on `arena-01` but are not yet used by movement.

- [x] Increase default hole width (`WALL_HOLE_WIDTH` in `house-helpers`) so doorways are comfortably passable (~2.0–2.4 m)
- [x] Flesh out collision map: axis-aligned segments + doorway hole metadata (extend `buildCollisionSegments` if needed)
- [x] Player circle (`PLAYER_RADIUS`) vs wall segments: block solid spans; allow passage only through holes
- [x] Integrate into `useFpsControls` (or `resolvePlayerCollision` util) **after** intended move, before commit
- [x] Outer bounds clamp remains as final fallback
- [x] Acceptance: cannot clip through ruin walls; can walk through holes; holes feel wider than 1.4 m default

## Testing — soldier render & locomotion

### Unit (Vitest)

- [x] `vitest.config.ts` + `@/` alias
- [x] `soldier-skin-registry.test.ts`
- [x] `scenario-registry.test.ts` (bounds + spawn sides + texture ids)
- [x] `resolve-soldier-clips.test.ts` — registry names resolve; `null` when a clip is missing; hips translation stripped on locomotion, kept on action clips
- [ ] `strip-root-motion.test.ts` — hips translation tracks removed from walk/run clips
- [ ] `swat-soldier-glb.test.ts` — **asset contract** (parse GLB JSON chunk):
  - clips: `idle`, `walk`, `run`, `jump`, `kneel`, `reloading`, `shooting` (and `dying` present but optional)
  - nodes: `Armature`, `Soldier_body`, `Soldier_head`
  - bones: `mixamorig:Hips`, neck, hands (no PropertyBinding orphans vs idle channels)
- [ ] `locomotion-state.test.ts` — pure fn: stand → `idle`, WASD → `walk`, WASD+Space → `run`
- [ ] Collision segment + hole math tests (when collision util is complete)
- [x] Head-bone / FPS hide helper test — Head (and Neck) scale to 0 in FPS; arm bones unchanged; restore for OTS/TPS

### E2E (Playwright)

- [x] `tests/e2e/play.spec.ts` — `/play` loads: `<canvas>` visible, boot/deploy loader dismissed, no `PropertyBinding` console errors
- [x] Optional dev hook `window.__PLAY_TEST__` (`soldierCount`, `mixerReady`, `activeClip`) when `E2E=true`
- [x] E2E asserts hook: at least one soldier in scene after load; mixer ready; clip is `idle` at spawn
- [x] E2E: crosshair overlay present (`data-testid`); `__PLAY_TEST__` still one local soldier after FPS (no second clone)

### Acceptance

- `npm run test:unit` fails if GLB clips/registry drift or hips strip breaks
- `npm run test:e2e` fails if `/play` canvas does not load or soldier/mixer hook regresses

## Later / other US

- [ ] `dying` animation hook-up (clip in GLB; wire on damage — US-3)
