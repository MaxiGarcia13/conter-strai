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

No god files today (~150 lines max). Prefer small extractions when editing these:

| File                              | Why                                    |
| --------------------------------- | -------------------------------------- |
| `house-helpers.ts`                | Wall segments with doorway holes       |
| `use-fps-controls.ts`             | Pointer lock + WASD + bounds clamp     |
| `scenario-walls.tsx`              | Outer perimeter + segments + UV tiling |
| `use-scenario-texture-library.ts` | PBR map load + material assembly       |
| `use-soldier-locomotion.ts`       | Mixer lifecycle + crossfade            |

## Soldier mesh setup duplication

`LocalPlayer` and `SoldierModel` repeat the same GLTF load / armature / scale / culling pipeline; locomotion is already shared via `useSoldierLocomotion`. Do **not** merge the two components — player transform, aim rig, FPS camera, and pose callbacks stay in `game/`.

- [ ] **Extract `useSoldierMesh`** — new hook in `src/modules/soldiers/hooks/use-soldier-mesh.ts` consolidating: `getSoldierSkinById`, `useGLTF`, `useSoldierAnimationClips`, `getSoldierArmature`, `soldierScaleVector`, and the `disableSkinnedMeshCulling` mount effect. Returns `{ modelRef, source, scale, skin, animations }`.
- [ ] **Refactor `SoldierModel`** — consume `useSoldierMesh`; keep NPC-only concerns (static `position` / `rotationY`, health-store pose via `resolveNpcPose`, conditional `WeaponAttach` / `HitboxMesh` when `entityId` is set).
- [ ] **Refactor `LocalPlayer`** — consume `useSoldierMesh`; keep game-only concerns (`useFrame` + `getPlayerTransform`, aim rig, `placeCameraAtHead`, `setBodyAnchorY`, pose clear callbacks).
