# Tech debt

Tracked cleanup from codebase audits. Not tied to a user story — pick items when touching nearby code or during a dedicated hygiene pass.

## Dead exports

Remove or stop exporting symbols with no callers (grep `src/` before deleting).

- [x] `measureFeetGroundOffset` — `src/modules/soldiers/utils/strip-root-motion.ts`
- [x] `updateSoldierSkeleton` — `src/modules/soldiers/utils/clone-soldier-root.ts`
- [x] `getTeamSpawn` (+ `TeamSpawn` if unused) — `src/modules/scenarios/utils/spawn-helpers.ts`
- [x] `applyUvRepeat` — un-export (only used inside `use-scenario-material.ts`)

## Scenario piece catalog (unused scaffolding)

Built for future maps; only `floorZone`, `wallAlongX` / `wallAlongZ`, and `buildHouses` are used by `arena-01/layout.ts`. Either wire into a second map or trim until needed.

- [x] `WALL_PIECES`, `wallBetween`, `placeWallPiece` — `src/modules/scenarios/pieces/wall-helpers.ts`
- [x] `FLOOR_PIECES`, `placeFloorPiece` — `src/modules/scenarios/pieces/floor-helpers.ts`
- [x] `WALL_LENGTH`, `STREET_WIDTH` — `src/modules/scenarios/pieces/constants.ts`
- [x] Unused material aliases: `WALL_MATERIAL.cliff`, `FLOOR_MATERIAL.forest`, `FLOOR_MATERIAL.street` (arena-01 uses texture ids directly)
- [x] Layout-only exports: make `arena01Streets`, `arena01Houses`, `houseFootprint` module-private if still only used in `layout.ts` / `house-helpers.ts`

## Inactive but wired infrastructure

Keep if the next US needs it; document or implement so it is not misleading dead weight.

- [x] **Props module** — `prop-registry.ts` is `{}`; `arena-01` has `props: []` but `PropInstance` is wired in `ScenarioScene`. Add at least one prop or add a one-line comment in registry that props are deferred.
- [x] **`game/index.ts` barrel** — nothing imports `@/modules/game`; either use the barrel from `play.astro` / islands or delete the re-export file.
- [x] **`scenarios/index.ts` re-exports `./pieces`** — broad public API unused outside map authoring; narrow exports or document as map-authoring surface only.

## Complexity hotspots (watch, not urgent)

No god files; prefer small extracts when editing these. Largest today: `use-soldier-locomotion.ts` (~270 lines).

| File                                                     | Why                                    |
| -------------------------------------------------------- | -------------------------------------- |
| `house-helpers.ts`                                       | Wall segments with doorway holes       |
| `hooks/use-player-controls/use-player-movement-frame.ts` | Move + collide + bounds + camera       |
| `hooks/use-player-controls/use-player-pointer-lock.ts`   | Click-lock + mouse look                |
| `dev/dev-free-camera.tsx`                                | Ghost fly + own key map                |
| `scenario-walls.tsx`                                     | Outer perimeter + segments + UV tiling |
| `use-scenario-texture-library.ts`                        | PBR map load + material assembly       |
| `use-soldier-locomotion.ts`                              | Mixer lifecycle + crossfade            |

## Player controls hygiene

Post-split leftovers from `use-player-controls` → folder + `game/utils`. Pick up when touching controls or free-cam.

- [ ] **Remove unused `isPointerLocked` plumbing**
  1. Grep `src/` for `isPointerLocked` (expect only the pointer-lock hook + orchestrator).
  2. In `use-player-pointer-lock.ts`: drop `useState`, the `pointerlockchange` listener that only feeds that state, and the return value; make the hook `void`.
  3. Keep eliminated → `exitPointerLock`, click-to-lock, and mouse look.
  4. In `use-player-controls.ts`: stop destructuring / returning `{ isPointerLocked }`.
  5. `player-controls.tsx` already ignores the return — no change there.

- [ ] **Stop exporting unused `UsePlayerControlsOptions`**
  1. Grep confirms only `hooks/use-player-controls/index.ts` re-exports it.
  2. Keep the interface in `use-player-controls.ts` for local typing.
  3. Remove `export type { UsePlayerControlsOptions }` from `index.ts`.

- [ ] **Share WASD axes in free-cam**
  1. In `dev-free-camera.tsx`, keep a local map only for free-cam extras (`up` / `down` / `boost` / `toggle`).
  2. For horizontal axes, use `axesFromPressedCodes(pressed, MOVE_CODES)` from `game/utils/axes-from-pressed-codes.ts` + `game/utils/move-codes.ts`.
  3. Leave vertical + boost math as-is.

- [ ] **Document or replace the look pitch floor**
  1. `use-player-pointer-lock.ts` gates look with `pitch >= -0.6` (free-cam does not).
  2. Default: add a named constant next to `PITCH_LIMIT` in `constants/player.ts` with a one-line comment (why look-down is limited for FPS).
  3. Only remove the gate (rely on `PITCH_LIMIT` alone) if playtest confirms full look-down is desired.

## Soldier mesh setup duplication

`LocalPlayer` and `SoldierModel` repeat the same GLTF load / armature / scale / culling pipeline; locomotion is already shared via `useSoldierLocomotion`. Do **not** merge the two components — player transform, aim rig, FPS camera, and pose callbacks stay in `game/`.

- [ ] **Extract `useSoldierMesh`** — new hook in `src/modules/soldiers/hooks/use-soldier-mesh.ts` consolidating: `getSoldierSkinById`, `useGLTF`, `useSoldierAnimationClips`, `getSoldierArmature`, `soldierScaleVector`, and the `disableSkinnedMeshCulling` mount effect. Returns `{ modelRef, source, scale, skin, animations }`.
- [ ] **Refactor `SoldierModel`** — consume `useSoldierMesh`; keep NPC-only concerns (static `position` / `rotationY`, health-store pose via `resolveNpcPose`, conditional `WeaponAttach` / `HitboxMesh` when `entityId` is set).
- [ ] **Refactor `LocalPlayer`** — consume `useSoldierMesh`; keep game-only concerns (`useFrame` + `getPlayerTransform`, aim rig, `placeCameraAtHead`, `setBodyAnchorY`, pose clear callbacks).

## Deferred from US-4

- [ ] **Shooting clip on LMB** — pack may include a `shooting` clip and the mixer can play it, but pointer-locked LMB does not set the pose (hitscan + SFX only). Wire one-shot `shooting` (not while reloading / jumping) once a shippable fire pose is approved.
