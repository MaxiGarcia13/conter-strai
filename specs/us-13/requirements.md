# US-13 — Pistol magazine reload & close-range impact marks

Depends on **US-4** (shipped — pistol hitscan, reload clips), **US-12** (shipped — mobile touch controls).

## Requirements

| ID       | Requirement                                                                                                                                                                                                                                                    |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| US-13.1  | Pistol has a **magazine of 12 shots** per reload cycle. Total ammo is **unlimited** — no pickups, no round ammo cap beyond the magazine.                                                                                                                       |
| US-13.2  | Each successful `fireWeapon()` call (hit or miss) consumes **one round** from the current magazine.                                                                                                                                                            |
| US-13.3  | When the magazine is **empty** (`shotsInMag >= 12`), `fireWeapon()` returns without firing (same gating family as cooldown / reload pose). **No auto-reload** — the player must reload manually.                                                               |
| US-13.4  | **R** (desktop) triggers the existing reload pose when idle (`reloading`) or kneeling (`reloading-kneel`). On mixer `finished`, the magazine refills to **12 available shots**. Voluntary reload while the magazine is not empty is allowed (tactical reload). |
| US-13.5  | Magazine state **resets to full** on round start / restart (offline `startRound` and multiplayer rematch deploy).                                                                                                                                              |
| US-13.6  | On **touch-primary**, a **reload** tap button in the mobile overlay calls `requestReload()` with the same pose rules as desktop **R** (idle or kneel only; WASD still cancels standing reload). Uses `ReloadIcon` from `src/components/icons/reload.tsx`.      |
| US-13.7  | Pause panel **Commands** on touch-primary lists reload with the reload icon (`MOBILE_BINDINGS.reload` → `MOBILE_COMMANDS`). Desktop Commands list unchanged (shows **R**).                                                                                     |
| US-13.8  | When a shot's raycast hits **visible world geometry** (walls, floor, props — untagged meshes) within **~2 m** of the camera, spawn a **client-only black impact mark** at the hit point (bullet-hole style). Marks are cosmetic; not synced to peers.          |
| US-13.9  | Impact marks are capped (FIFO eviction, ~40 marks) and cleared on round start. Soldier hits do not spawn marks; a close wall in front of a farther soldier still gets a mark on the wall.                                                                      |
| US-13.10 | Magazine gating is **client-side only** (same trust model as client raycast). Server `shot` / `fire` messages and fire-rate cooldown are unchanged.                                                                                                            |

## Acceptance

1. Solo `/room/{id}/play` (desktop): fire 12 times — 13th click does nothing (no SFX). Press **R** while idle — reload animation plays; after it finishes, can fire 12 more times.
2. Reload while kneeling uses `reloading-kneel`; returns to kneel on finish; magazine refills.
3. WASD during standing reload cancels reload (existing behavior); magazine does **not** refill until a reload completes.
4. Touch-primary: reload button visible; tap reload when idle/kneel refills magazine; fire button blocked when empty.
5. Point-blank wall shot (≤ ~2 m): black mark appears on the surface; shot beyond 2 m at a wall leaves no mark.
6. Round restart clears magazine to full and removes impact marks.
7. `npm run test:unit` passes including new magazine gating and `pick-close-world-impact` tests.

## Out of scope (this US)

- HUD ammo counter (e.g. `7/12` near crosshair)
- Auto-reload animation when the magazine empties
- Server-authoritative magazine / anti-cheat
- Syncing impact marks to remote clients
- Shooting pose clip on LMB (still deferred per FR-22)
- Reload while walking / running (inherits desktop idle-only standing reload rule)
- Impact marks on soldier meshes
