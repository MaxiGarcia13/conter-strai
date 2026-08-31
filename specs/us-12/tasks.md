# US-12 — Tasks

**US-11** is shipped. Tick only when the matching requirement passes.

See [`design.md`](./design.md) and [`requirements.md`](./requirements.md).

## Spec & bindings (US-12.8)

- [x] Add `MOBILE_BINDINGS` to `src/modules/game/constants/game-bindings.ts` (labels for pause panel Commands)
- [x] Optional: `game-pause-panel.tsx` — show mobile labels in Commands when touch-primary

## Input intent layer (US-12.8)

- [x] Add `src/modules/game/input/types.ts` — `PlayerFrameIntent`, `GameAction`
- [x] Add `src/modules/game/input/player-input-intent.ts` — imperative ref + merge keyboard/touch
- [x] Add `src/modules/game/input/utils/is-touch-primary-device.ts` — `(pointer: coarse)` gate
- [x] Add `src/modules/game/input/utils/apply-look-delta.ts` — extract from `use-player-pointer-lock.ts`
- [x] Add `src/modules/game/input/utils/joystick-to-axes.ts` — vector → `{ strafe, forward }` + dead zone
- [x] Unit: `tests/units/game/apply-look-delta.test.ts`
- [x] Unit: `tests/units/game/joystick-to-axes.test.ts`
- [x] Unit: `tests/units/game/is-touch-primary-device.test.ts` (mock matchMedia)

## Fire service extract (US-12.4)

- [x] Add `src/modules/game/utils/fire-weapon.ts` — extract body from `use-shooting.ts`
- [x] Refactor `use-shooting.ts` to call `fireWeapon()`; skip pointer-lock gate on touch-primary
- [x] Unit: `tests/units/game/fire-weapon.test.ts` (gating: pause, phase, pose, cooldown)

## Wire movement & look consumers (US-12.1–US-12.3)

- [x] Refactor `use-player-movement-frame.ts` — read merged `PlayerFrameIntent`
- [x] Refactor `use-player-pointer-lock.ts` — use `applyLookDelta`; no-op lock request on touch-primary
- [x] Verify desktop regression: WASD, Space sprint, pointer-lock look unchanged

## Mobile UI components (US-12.1–US-12.6)

- [ ] Add `src/modules/game/input/components/mobile-controls/virtual-joystick.tsx`
- [ ] Add `src/modules/game/input/components/mobile-controls/action-button.tsx`
- [ ] Add `src/modules/game/input/components/mobile-controls/look-zone.tsx`
- [ ] Add `src/modules/game/input/components/mobile-controls/pause-button.tsx`
- [ ] Add `src/modules/game/input/components/mobile-controls/mobile-controls.tsx` — orchestrator
- [ ] Add `src/modules/game/input/components/mobile-controls/index.ts` — public barrel
- [ ] Add `src/modules/game/input/hooks/use-touch-look/` — drag → `applyLookDelta`

## HUD & canvas integration (US-12.6–US-12.9)

- [ ] Relocate `health-bar.tsx` to top-right + safe-area insets
- [ ] Hide `camera-hud.tsx` on touch-primary
- [ ] Mount `<MobileControls />` in `game-canvas.tsx`
- [ ] Apply `touch-action: none` on `#game-canvas` when mobile controls active

## Pause panel — camera cycle (US-12.11)

- [ ] Extract shared `CAMERA_MODE_LABELS` (e.g. `game/constants/camera-mode-labels.ts`) — used by `camera-hud.tsx` and `game-pause-panel.tsx`
- [ ] Add `MOBILE_BINDINGS.cameraCycle` — `"Pause menu → Cycle camera"`; include in `MOBILE_COMMANDS`
- [ ] `game-pause-panel.tsx` — show active camera mode label + **Cycle camera** button on main pause view; calls `cycleCameraMode()`

## Acceptance & ship

- [ ] Manual QA on touch-primary device: move, look, fire, kneel, sprint, pause panel, **cycle camera from pause menu**
- [ ] Manual QA on desktop: no overlay; keyboard/mouse unchanged
- [ ] `npm run test:unit` green
- [ ] Update `README.md` — document mobile play on touch devices (on-screen move/look/shoot controls); adjust the “keyboard and mouse” line so desktop and mobile are both covered
- [ ] Fold FR-56+ into `specs/current/requirements.md`; remove mobile from out-of-scope
- [ ] Merge design notes into `specs/current/design.md` (input module + mobile layout)
- [ ] Add CHANGELOG row; delete `specs/us-12/`; update `specs/current/tasks.md`
