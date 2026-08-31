# US-12 — Mobile touch controls

Depends on **US-2** (shipped), **US-9** (shipped — pause menu).

## Requirements

| ID       | Requirement                                                                                                                                                                                                                                                                  |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| US-12.1  | On **touch-primary** devices (`(pointer: coarse)`), `/room/{id}/play` shows on-screen controls for **move**, **look**, **shoot**, **kneel toggle**, and **sprint (hold)**. Desktop keyboard + pointer-lock behavior is unchanged.                                            |
| US-12.2  | **Move:** virtual joystick (bottom-left) produces `{ strafe, forward }` axes with ~10% dead zone; feeds the same movement pipeline as WASD (`advancePlayerTransform`).                                                                                                       |
| US-12.3  | **Look:** touch-drag on the right ~50% of the screen rotates yaw/pitch using the same sensitivity and pitch limits as mouse look; no pointer-lock prompt on touch-primary.                                                                                                   |
| US-12.4  | **Shoot:** bottom-right fire button triggers the same hitscan path as LMB (`fireWeapon` service) with existing gating (pause, phase, pose, cooldown). Pointer-lock is **not** required on touch-primary.                                                                     |
| US-12.5  | **Kneel:** tap button toggles kneel via `toggleKneel()` (same rules as Shift — idle-only entry). **Sprint:** hold button sets `running: true` while moving (same as Space hold).                                                                                             |
| US-12.6  | **Pause:** top-left button calls `setPaused(true)` during **`live`** phase and opens the existing `GamePausePanel` (Resume / Restart / Leave / Commands). Replaces Esc on mobile. Min ~44×44 px tap target.                                                                  |
| US-12.7  | **Health bar** moves from bottom-left to **top-right** with safe-area insets. **Camera HUD** (C-cycle label) is hidden on touch-primary. Top bar layout: pause left, health right.                                                                                           |
| US-12.8  | Input is **modular:** touch UI lives under `src/modules/game/input/`; writes intent only — no coupling to R3F hooks, combat, or soldier locomotion internals. Desktop and touch are separate **providers** feeding a shared intent layer consumed by movement / look / fire. |
| US-12.9  | Canvas uses `touch-action: none` when mobile controls are active; touch handlers call `preventDefault` where needed to suppress scroll/zoom. Mobile overlay uses `pointer-events-auto`; decorative HUD stays non-interactive except control targets.                         |
| US-12.10 | Optional: pause panel **Commands** list shows `MOBILE_BINDINGS` labels (joystick, look zone, button names) instead of keyboard keys when touch-primary. Desktop list unchanged.                                                                                              |

## Acceptance

1. On a touch-primary device (or `(pointer: coarse)` emulation): solo `/room/{id}/play` — move with joystick, look by dragging right side, fire, kneel toggle, sprint hold; no pointer-lock prompt.
2. Top-left pause opens `GamePausePanel`; Resume closes and restores controls.
3. Health bar visible top-right; camera mode HUD hidden on touch-primary.
4. Desktop Chrome/Firefox/Safari: WASD + pointer-lock + LMB unchanged; no mobile overlay visible.
5. `npm run test:unit` passes including new intent / look-delta / joystick mapping tests.

## Out of scope (this US)

- Jump, reload, camera cycle on-screen buttons
- Gamepad API
- Touch controls on non-touch-primary viewports (e.g. narrow desktop window)
- Server-side changes (client intent only)
- Shooting pose clip on fire (still deferred per FR-22)
- Kneel-from-walk behavior change (inherits desktop `toggleKneel` idle-only rule)
