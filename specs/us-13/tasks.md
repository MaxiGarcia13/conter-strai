# US-13 — Tasks

**US-12** is shipped. Tick only when the matching requirement passes.

See [`design.md`](./design.md) and [`requirements.md`](./requirements.md).

## Constants & magazine store (US-13.1–US-13.5)

- [x] Add `PISTOL_MAGAZINE_SIZE = 12` to `src/modules/weapons/constants/pistol.ts`
- [x] Add `src/modules/game/stores/weapon-ammo-store.ts` — `shotsInMag`, `recordShot`, `needsReload`, `onReloadComplete`, `reset`
- [x] `fire-weapon.ts` — block when `needsReload()`; call `recordShot()` after cooldown stamp; export test reset helper
- [x] `local-player.tsx` — `clearReloadingPose()` calls `onReloadComplete()`
- [x] `round-store.ts` `startRound` — reset weapon ammo store
- [x] Unit: extend `tests/units/game/fire-weapon.test.ts` (12-shot limit, reload refill, existing reload-pose block still passes)

## Mobile reload button (US-13.6–US-13.7)

- [ ] Export `ReloadIcon` from `src/components/icons/index.ts`
- [ ] `action-button.tsx` — add `'reload'` mode (tap → `onAction`, same as kneel)
- [ ] `mobile-controls.tsx` — reload button in kneel/run row → `requestReload()`
- [ ] `game-bindings.ts` — `MOBILE_BINDINGS.reload` with `iconId: 'reload'`; extend `GameCommandIconId`; append to `MOBILE_COMMANDS`
- [ ] `command-icon.tsx` — map `reload` → `ReloadIcon`

## Close-range impact marks (US-13.8–US-13.9)

- [ ] Add `CLOSE_RANGE_IMPACT_METERS = 2` to `src/modules/weapons/constants/pistol.ts` (or colocate with helper)
- [ ] Add `src/modules/game/utils/pick-close-world-impact.ts`
- [ ] Add `src/modules/game/stores/bullet-impact-store.ts` — FIFO cap ~40, `reset` on round start
- [ ] Add `src/modules/game/components/bullet-impact-marks/bullet-impact-marks.tsx` (+ barrel `index.ts`)
- [ ] `fire-weapon.ts` — after raycast, push close world impacts to store
- [ ] `game-canvas.tsx` — mount `<BulletImpactMarks />` inside `<Canvas>`
- [ ] `round-store.ts` `startRound` — reset bullet impact store
- [ ] Unit: `tests/units/game/pick-close-world-impact.test.ts`

## Ammo HUD (US-13.11)

- [x] Add `src/modules/game/utils/get-rounds-remaining.ts` — `PISTOL_MAGAZINE_SIZE - shotsInMag`
- [x] Unit: `tests/units/game/get-rounds-remaining.test.ts`
- [x] Add `src/modules/game/components/ammo-hud.tsx` — `remaining / PISTOL_MAGAZINE_SIZE`, `role="status"`, accent when empty
- [x] Refactor `health-bar.tsx` — inner content only (no fixed positioning)
- [x] Add `src/modules/game/components/player-hud.tsx` — stacks health + ammo; bottom-left desktop, top-right touch-primary (same corners as FR-19)
- [x] `game-canvas.tsx` — replace standalone `<HealthBar />` with `<PlayerHud />`

## Acceptance & ship

- [ ] Manual QA (desktop): 12 shots → blocked; R reload → fire again; point-blank wall mark; distant wall no mark
- [ ] Manual QA (touch-primary): reload button refills mag; empty mag blocks fire; pause Commands shows reload icon
- [ ] Manual QA: ammo HUD shows `remaining/12`, decrements on fire, refills after reload; grouped with health bar (bottom-left desktop, top-right mobile)
- [ ] Round restart clears marks and refills magazine
- [ ] `npm run test:unit` green
- [ ] Fold US-13 into `specs/current/requirements.md` and `specs/current/design.md`
- [ ] Update out-of-scope in current requirements (reload on-screen button no longer deferred)
- [ ] Add CHANGELOG row for **US-13**; delete `specs/us-13/`; update `specs/current/tasks.md`
