# US-12 — Design

## Problem

Gameplay input is desktop-only: WASD, pointer-lock mouse look, LMB shoot, Esc pause. Mobile is listed **out of scope** in [`specs/current/requirements.md`](../current/requirements.md). Touch-primary users cannot play on `/play`.

## Principles

- **Modular providers** — keyboard/mouse and touch are separate input providers; domain code stays device-agnostic.
- **Reuse domain seams** — `advancePlayerTransform`, `player-pose-actions`, combat raycast; extract shared look/fire helpers rather than duplicating logic.
- **Minimal integration surface** — `GameCanvas` mounts one `<MobileControls />` overlay; movement hook reads merged intent.
- **Desktop unchanged** — overlay gated by `(pointer: coarse)`; pointer lock and keyboard hooks behave as today.

## Architecture

```mermaid
flowchart LR
  subgraph providers [Input providers]
    KB[Keyboard + mouse]
    Touch[MobileControls overlay]
  end

  subgraph intent [game/input/]
    Ref[player-input-intent ref]
    LookUtil[applyLookDelta]
    FireSvc[fireWeapon service]
  end

  subgraph consumers [Existing consumers]
    MF[usePlayerMovementFrame]
    PL[usePlayerPointerLock]
    Shoot[useShooting]
    Pose[player-pose-actions]
    Pause[game-pause-store]
  end

  KB --> Ref
  Touch --> Ref
  Touch --> LookUtil
  Touch --> FireSvc
  Touch --> Pose
  Touch --> Pause
  Ref --> MF
  LookUtil --> PL
  FireSvc --> Shoot
```

## Module layout

```
src/modules/game/input/
  types.ts                          # PlayerFrameIntent, GameAction
  player-input-intent.ts            # imperative ref (hot path, not Zustand)
  utils/
    apply-look-delta.ts             # shared yaw/pitch delta (from pointer-lock hook)
    is-touch-primary-device.ts      # (pointer: coarse) gate
    joystick-to-axes.ts             # vector → { strafe, forward }
  hooks/
    use-touch-look/                 # right-half drag → applyLookDelta
  components/
    mobile-controls/
      mobile-controls.tsx           # orchestrator; device gate
      virtual-joystick.tsx
      action-button.tsx
      look-zone.tsx
      pause-button.tsx
      index.ts                      # public export only

src/modules/game/services/
  fire-weapon.ts                    # extracted from use-shooting.ts
```

## Types

```ts
// src/modules/game/input/types.ts
export interface PlayerFrameIntent {
  strafe: -1 | 0 | 1;
  forward: -1 | 0 | 1;
  running: boolean;
}

export type GameAction = 'kneelToggle' | 'sprint' | 'shoot' | 'pause';
```

Intent ref API (imperative, per-frame):

- `getPlayerFrameIntent()` — merged keyboard + touch for movement frame
- `setTouchMoveIntent(strafe, forward)`, `setTouchRunning(running)`, `clearTouchMoveIntent()`
- `isTouchPrimaryDevice()` — `(pointer: coarse)` matchMedia

## UI layout (touch-primary)

```
┌─────────────────────────────────────────┐
│  [⏸ Pause]                    [HP ████] │  ← safe-area top
│                                         │
│              (look drag zone)           │
│                                         │
│  [joystick]              [kneel][run]   │
│                               [ FIRE ]  │
└─────────────────────────────────────────┘
```

| Zone               | Component               | Action                                   |
| ------------------ | ----------------------- | ---------------------------------------- |
| Top-left           | `PauseButton`           | `setPaused(true)` → `GamePausePanel`     |
| Top-right          | `HealthBar` (relocated) | existing combat HUD                      |
| Bottom-left        | `VirtualJoystick`       | move axes                                |
| Bottom-right stack | `ActionButton` × 3      | kneel (tap), run (hold), fire (tap/hold) |
| Right ~50%         | `LookZone`              | touch-drag look                          |

## Integration points

| File                                                                                                            | Change                                                            |
| --------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| [`use-player-movement-frame.ts`](../../src/modules/game/hooks/use-player-controls/use-player-movement-frame.ts) | Read `PlayerFrameIntent` (keyboard OR touch)                      |
| [`use-player-pointer-lock.ts`](../../src/modules/game/hooks/use-player-controls/use-player-pointer-lock.ts)     | Skip lock on touch-primary; use `applyLookDelta`                  |
| [`use-shooting.ts`](../../src/modules/game/hooks/use-shooting.ts)                                               | Delegate to `fireWeapon()`; no pointer-lock gate on touch-primary |
| [`game-canvas.tsx`](../../src/modules/game/components/game-canvas/game-canvas.tsx)                              | Mount `<MobileControls />`                                        |
| [`health-bar.tsx`](../../src/modules/combat/components/health-bar.tsx)                                          | `top-4 right-4` + safe-area                                       |
| [`camera-hud.tsx`](../../src/modules/game/components/camera-hud.tsx)                                            | Hide when touch-primary                                           |
| [`game-bindings.ts`](../../src/modules/game/constants/game-bindings.ts)                                         | Add `MOBILE_BINDINGS` (optional Commands labels)                  |

## Coupling rules

- `mobile-controls` imports: `input/*`, `player-pose-actions`, `fire-weapon`, `game-pause-store` — **never** `usePlayerControls` internals or R3F hooks.
- No touch listeners inside `combat/`, `soldiers/`, or pure movement utils.
- `player-state` stays imperative; do not mirror into React state for touch.

## Risks

| Risk                             | Mitigation                                                    |
| -------------------------------- | ------------------------------------------------------------- |
| Fire button drag triggers look   | `stopPropagation` on buttons; look zone excludes button rects |
| Kneel idle-only (desktop parity) | Document in acceptance; no behavior change this US            |
| Notched phones clip HUD          | `env(safe-area-inset-*)` on top bar                           |
