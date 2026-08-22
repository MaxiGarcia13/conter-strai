# Conter Strai — Requirements (current)

Living product contract. Open deltas extend this until shipped.

## Functional

| ID | Requirement |
|----|-------------|
| FR-1 | Landing shows game title, short description, `soldiers.png`, **Start Game** → `/play`, and **shooter game theme** (dark tactical UI — see US-1) |
| FR-2 | `/play` loads one 3D scenario with floor + walls from texture GLBs |
| FR-3 | Local player moves with **WASD + mouse look** (FPS); pointer lock on click |
| FR-4 | Soldier model is data-driven (`swat-guy` default); registry supports future models |
| FR-5 | Scenario is data-driven (`arena-01` default); registry supports future maps |
| FR-6 | Each soldier has **100 HP** (configurable max) |
| FR-7 | Bullet hits reduce HP by zone: **head 50%**, **limbs 15%**, **body 20%** of max HP |
| FR-8 | Difficulty presets adjust incoming damage |
| FR-9 | At 0 HP, soldier is **eliminated**; respawn after delay |
| FR-10 | PvP: players can shoot and damage each other |

## Non-functional

| ID | Requirement |
|----|-------------|
| NFR-1 | Spec before code for each US |
| NFR-2 | Domain logic in `services/` / `utils/` — no Three.js inside pure services |
| NFR-3 | Game island dynamically imported on `/play` to keep landing bundle small |
| NFR-4 | `prefers-reduced-motion`: disable camera bob / optional effects |
| NFR-5 | Works in latest Chrome/Firefox/Safari desktop |
| NFR-6 | Astro pages + R3F island split — no Three.js on the landing route |
| NFR-7 | Unit tests for pure domain logic; skip testing Three.js render internals |

## Out of scope (MVP)

- Matchmaking, ranks, economy, multiple weapons
- Mobile touch controls
- Dedicated backend (Playroom handles multiplayer layer in US-5)
