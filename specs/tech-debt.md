# Tech debt

Tracked cleanup from codebase audits. Not tied to a user story — pick items when touching nearby code or during a dedicated hygiene pass.

## Dead exports

Remove or stop exporting symbols with no callers (grep `src/` before deleting).

- [x] `measureFeetGroundOffset` — `src/modules/soldiers/utils/strip-root-motion.ts`
- [x] `updateSoldierSkeleton` — `src/modules/soldiers/utils/clone-soldier-root.ts`
- [ ] `getTeamSpawn` (+ `TeamSpawn` if unused) — `src/modules/scenarios/utils/spawn-helpers.ts`
- [ ] `applyUvRepeat` — un-export (only used inside `use-scenario-material.ts`)

## Scenario piece catalog (unused scaffolding)

Built for future maps; only `floorZone`, `wallAlongX` / `wallAlongZ`, and `buildHouses` are used by `arena-01/layout.ts`. Either wire into a second map or trim until needed.

- [ ] `WALL_PIECES`, `wallBetween`, `placeWallPiece` — `src/modules/scenarios/pieces/wall-helpers.ts`
- [ ] `FLOOR_PIECES`, `placeFloorPiece` — `src/modules/scenarios/pieces/floor-helpers.ts`
- [ ] `WALL_LENGTH`, `STREET_WIDTH` — `src/modules/scenarios/pieces/constants.ts`
- [ ] Unused material aliases: `WALL_MATERIAL.cliff`, `FLOOR_MATERIAL.forest`, `FLOOR_MATERIAL.street` (arena-01 uses texture ids directly)
- [ ] Layout-only exports: make `arena01Streets`, `arena01Houses`, `houseFootprint` module-private if still only used in `layout.ts` / `house-helpers.ts`

## Inactive but wired infrastructure

Keep if the next US needs it; document or implement so it is not misleading dead weight.

- [ ] **Props module** — `prop-registry.ts` is `{}`; `arena-01` has `props: []` but `PropInstance` is wired in `ScenarioScene`. Add at least one prop or add a one-line comment in registry that props are deferred.
- [ ] **`game/index.ts` barrel** — nothing imports `@/modules/game`; either use the barrel from `play.astro` / islands or delete the re-export file.
- [ ] **`scenarios/index.ts` re-exports `./pieces`** — broad public API unused outside map authoring; narrow exports or document as map-authoring surface only.

## Dependencies

- [ ] **`zustand`** — listed in `package.json` and README; zero imports in `src/`. Remove until US-3 health store lands, or add the store and drop this item.

## Tooling

- [ ] Add [Knip](https://knip.dev/) (or equivalent) to CI / pre-commit to catch unused exports, files, and dependencies after the manual cleanup above.

## Complexity hotspots (watch, not urgent)

No god files today (~150 lines max). Prefer small extractions when editing these:

| File | Why |
|------|-----|
| `house-helpers.ts` | Wall segments with doorway holes |
| `use-fps-controls.ts` | Pointer lock + WASD + bounds clamp |
| `scenario-walls.tsx` | Outer perimeter + segments + UV tiling |
| `use-scenario-texture-library.ts` | PBR map load + material assembly |
| `use-soldier-locomotion.ts` | Mixer lifecycle + crossfade + hips lock |
