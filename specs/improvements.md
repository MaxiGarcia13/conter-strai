# Improvements backlog

Player-facing polish and feel items. Not tied to a user story — pick when touching nearby systems or during a dedicated polish pass. For hygiene / dead code, see [tech-debt.md](./tech-debt.md).

## 1. Dark clothing / lighting ✅

**Symptom:** Skins with black or very dark clothing look crushed and unreadably black in the arena and in the lobby character preview.

**Scope:** Arena play (`game-canvas`), lobby preview (`character-preview`), scenario environment config.

**Likely cause:** Minimal lighting setup — `ambient 0.6` plus a single `directionalLight` (`sunIntensity 1.2`), with no fill light, hemisphere light, image-based lighting (IBL), or tone mapping. Dark PBR albedo on soldier meshes reads as flat black under these conditions. Same values are duplicated in:

- `src/modules/scenarios/maps/arena-01/index.ts`
- `src/modules/game/components/game-canvas.tsx`
- `src/modules/lobby/components/character-preview.tsx`

**Suggested direction:**

- Raise ambient or add a hemisphere / fill light so dark fabrics retain detail.
- Consider `@react-three/drei` `Environment` (IBL) for lobby preview and in-match character rendering.
- Optional: enable `renderer.toneMapping` on Canvas for better PBR response.
- Centralize lighting presets via `ArenaEnvironment` (`src/modules/scenarios/types.ts`) so preview and arena stay consistent.

**Acceptance:** Dark-cloth soldier skins show visible fabric detail and shading in the lobby character preview and in-match at first-person, over-the-shoulder, and third-person camera modes.

**Spec touch:** None required unless lighting becomes scenario-authorable beyond ambient/sun intensity.

---

## 2. Kneel (and jump) while walking — local controls ✅

**Symptom:** Player cannot kneel while already walking. Jump while walking may feel broken (verify in-game).

**Scope:** Local FPS controls, animation mixer, player pose state.

**Likely cause:**

- **Kneel:** `toggleKneel` in `src/modules/game/utils/player-pose-actions.ts` requires `!movePressed` — kneel only works from idle. Animation support for kneel + walk already exists (`crouchWalking` clip via `src/modules/soldiers/utils/resolve-animation-clip-key.ts`).
- **Jump:** `requestJump` only requires `pose === null`, so jump while walking should work locally; confirm with a repro before changing code.

**Suggested direction:**

- Remove the `!movePressed` guard in `toggleKneel`; allow `setPlayerPose('kneel')` while locomotion is `walk` or `run` (mixer already resolves `crouchWalking` / run-over-kneel per FR-15).
- Verify jump-from-walk in solo play; fix only if a repro exists.

**Acceptance:** Pressing **E** while walking transitions into crouch-walk (or stand-run if sprinting). **F** jump works from walk when no blocking pose is active.

**Spec touch:** Shipped [FR-15](./current/requirements.md) describes kneel-from-idle then walk-while-kneeling. Entering kneel mid-walk is a **behavior change** — update FR-15 if intentional.

---

## 3. Remote kneel / jump not visible in multiplayer

**Symptom:** When a remote player kneels or jumps, other clients only see idle / walk / run inferred from position deltas — not the pose animation.

**Scope:** Colyseus sync, remote player rendering, adapter + schema.

**Likely cause:** Network sync sends position only (`x`, `z`, `rotY` via `src/modules/multiplayer/hooks/use-local-transform-sync.ts`). `PlayerStateSchema` (`src/modules/multiplayer/schema/player-state.ts`) has no `pose` field. `RemotePlayer` (`src/modules/multiplayer/components/remote-player.tsx`) uses `resolveNpcPose` (`src/modules/soldiers/utils/resolve-soldier-pose.ts`), which returns only `dying` or `hitReaction` — never `kneel` or `jump`.

**Suggested direction:**

Add pose to the sync path (pick one at implementation time):

- **A (minimal):** Ephemeral client message `pose` (`jump` | `kneel` | `clear`) relayed/broadcast by the server; cosmetic one-shots need no authority.
- **B (schema):** Add `pose` / `locomotion` fields to `PlayerStateSchema` (heavier, schema migration).

Then:

- Extend `RemotePlayerEntry`, adapter payloads, and pose resolution to drive `useSoldierLocomotion` `getPose`.
- Wire the local player to emit pose changes alongside transform sync.

**Acceptance:** Two clients in a live match see each other's kneel and jump animations within one round-trip of the action.

**Spec touch:** Extend US-5 multiplayer design or add a small US delta for pose sync semantics.

---

## 4. Spatial combat SFX for remote players

**Symptom:** Gunshots and injury sounds from remote players are not heard (or not distance-attenuated) by peers.

**Scope:** Multiplayer audio, shot handling, health sync.

**Likely cause:**

- **Gunshots:** Only the shooter hears their shot (`src/modules/game/hooks/use-shooting.ts` plays at camera). The server applies damage via the `shot` message but does not broadcast a fire event to other clients ([US-5 design](./us-5/design.md): "no shot broadcast needed" for damage).
- **Ouch:** `useSpatialCombatSounds` (`src/modules/game/hooks/use-spatial-combat-sounds.ts`) subscribes to `useHealthStore`, but in multiplayer only the local player's HP is mirrored there (`src/modules/multiplayer/services/bind-match.ts`). Remote HP lives in `multiplayerStore` only, so peer injury SFX never fires. Spatial infra already exists (`src/modules/game/utils/play-game-sound.ts`, 40 m falloff via `COMBAT_SOUND_MAX_DISTANCE`).

**Suggested direction:**

- **Gunshot:** Broadcast a lightweight `fire` event (shooter `sessionId` + optional position) when the server validates a shot or when the client sends one; peers call `playEntityGameSound('pistol', shooterId, ...)`.
- **Ouch:** On `applyPlayersUpdate`, detect remote HP drops (same logic as `src/modules/multiplayer/services/resolve-server-health-effects.ts`) and play spatial ouch at the victim's world position — extend `useSpatialCombatSounds` or hook in `bind-match`.
- Reuse existing `COMBAT_SOUND_MAX_DISTANCE` and `GAME_SOUND_GAIN` constants.

**Acceptance:** Standing near a remote player, gunshots and injury grunts are audible and quieter when far away (~40 m falloff). Local player's own gunshot remains full volume at the camera.

**Spec touch:** Extend US-5 design with fire-event broadcast; no FR change unless audio is listed as a functional requirement.
