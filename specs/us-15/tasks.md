# US-15 — Tasks

Tick when done; ship into `specs/current/` when all acceptance criteria in [requirements.md](./requirements.md) pass.

Depends on **US-14** window segment + `baseY` work (already in tree). Prefer implementing after US-14 smoke, but types can land in parallel.

## Spec

- [ ] Review [requirements.md](./requirements.md) and [design.md](./design.md) with implementer

## Types + parsing

- [ ] Add `WallDoorSpec`, `WallWindowSpec`, `WallHoleSpec` to [`house-helpers.ts`](../../src/modules/scenarios/pieces/house-helpers.ts)
- [ ] Extend `HouseSide` with optional `holes?: WallHoleSpec[]` (keep `hole` shorthand)
- [ ] Add `normalizeOpenings(side) → WallHoleSpec[]` in [`wall-segment-helpers.ts`](../../src/modules/scenarios/pieces/wall-segment-helpers.ts) (`holes` wins over `hole`; default `along: 0`)

## Segment generation

- [ ] Generalize `wallSegmentsAlongX` / `wallSegmentsAlongZ` to walk sorted openings (solid spans + door gaps + window sill/lintel at each `along`)
- [ ] Shared validation: end remnant 0.3 m, adjacent gap 0.6 m, US-14 window height check — failure → solid wall
- [ ] Update `collisionHole()` — one metadata entry per door at `center + along` along the wall axis

## Tests

- [ ] Two openings on one side (door + window) — expected span count, door gap, window sill/lintel `baseY`
- [ ] `along` places opening center at `wallCenter + along` (X walls and Z walls)
- [ ] Overlap / too-close / past-end / invalid window height → solid wall
- [ ] `{ hole: number }` and `{ hole: { width, height } }` still produce the US-14 single centered layout (regression)
- [ ] `collisionHole()` count and centers for offset doors; windows still omitted
- [ ] Existing [`wall-corners.test.ts`](../../tests/units/scenarios/wall-corners.test.ts) still passes
- [ ] Update [`scenario-registry.test.ts`](../../tests/units/scenarios/scenario-registry.test.ts) if arena door count/centers change

## Map authoring

- [ ] Convert [`house-right-tall` west](../../src/modules/scenarios/maps/arena-01/houses.ts) to `holes` with an offset door and offset window (FR-82)

## Acceptance

- [ ] `npm run test:unit` green
- [ ] Manual smoke: arena-01 `house-right-tall` west shows two openings; door passable; window blocks movement; hitscan through window gap

## Ship

- [ ] Fold FR-76–FR-82 into `specs/current/requirements.md`
- [ ] Update `specs/current/design.md` (interior collision + arena-01)
- [ ] Add **US-15** row to `specs/CHANGELOG.md`; clear Open row (keep US-14 until it ships)
- [ ] Delete `specs/us-15/`
