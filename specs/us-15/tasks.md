# US-15 — Tasks

Tick when done; ship into `specs/current/` when all acceptance criteria in [requirements.md](./requirements.md) pass.

Depends on **US-14** window segment + `baseY` work (already in tree). Prefer implementing after US-14 smoke, but types can land in parallel.

## Spec

- [x] Review [requirements.md](./requirements.md) and [design.md](./design.md) with implementer

## Types + parsing

- [x] Add `WallDoorSpec`, `WallWindowSpec`, `WallHoleSpec` to [`house-helpers.ts`](../../src/modules/scenarios/pieces/house-helpers.ts)
- [x] Extend `HouseSide` with optional `holes?: WallHoleSpec[]` (keep `hole` shorthand)
- [x] Add `normalizeOpenings(side) → WallHoleSpec[]` in [`wall-opening-helpers.ts`](../../src/modules/scenarios/pieces/wall-opening-helpers.ts) (`holes` wins over `hole`; default `along: 0`)

## Segment generation

- [x] Generalize `wallSegmentsAlongX` / `wallSegmentsAlongZ` to walk sorted openings (solid spans + door gaps + window sill/lintel at each `along`) — `wallSegmentsFromOpenings()`
- [x] Shared validation: end remnant 0.3 m, adjacent gap 0.6 m, US-14 window height check — failure → solid wall — `validateOpenings()`
- [x] Update `collisionHole()` — one metadata entry per door at `center + along` along the wall axis

## Tests

- [x] Two openings on one side (door + window) — expected span count, door gap, window sill/lintel `baseY`
- [x] `along` places opening center at `wallCenter + along` (X walls and Z walls)
- [x] Overlap / too-close / past-end / invalid window height → solid wall
- [x] `{ hole: number }` and `{ hole: { width, height } }` still produce the US-14 single centered layout (regression) — covered by existing doorway/window tests in `collision-hole-math.test.ts`
- [x] `collisionHole()` count and centers for offset doors; windows still omitted
- [x] Existing [`wall-corners.test.ts`](../../tests/units/scenarios/wall-corners.test.ts) still passes
- [x] Update [`scenario-registry.test.ts`](../../tests/units/scenarios/scenario-registry.test.ts) if arena door count/centers change — unchanged (arena-01 map untouched), still passes

## Map authoring

- [x] Convert [`house-right-tall` west](../../src/modules/scenarios/maps/arena-01/houses.ts) to `holes` with an offset door (`along: -3`) and offset window (`along: 3.5`) (FR-82)

## Acceptance

- [ ] `npm run test:unit` green
- [ ] Manual smoke: arena-01 `house-right-tall` west shows two openings; door passable; window blocks movement; hitscan through window gap

## Ship

- [ ] Fold FR-76–FR-82 into `specs/current/requirements.md`
- [ ] Update `specs/current/design.md` (interior collision + arena-01)
- [ ] Add **US-15** row to `specs/CHANGELOG.md`; clear Open row (keep US-14 until it ships)
- [ ] Delete `specs/us-15/`
