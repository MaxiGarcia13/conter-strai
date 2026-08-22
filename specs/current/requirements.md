# Conter Strai — Requirements (current)

Living product contract. Open deltas extend this until shipped.

## Game rules

Conter Strai is a **round-based team tactical shooter** inspired by Counter-Strike.

| Rule                    | Detail                                                                                          |
| ----------------------- | ----------------------------------------------------------------------------------------------- |
| **Teams**               | Two sides — **Puma** vs **Lion** (national animals: Argentina / England) — assigned at match/round start |
| **Objective**           | Eliminate the opposing team (team deathmatch). Future modes may add bomb defusal, capture, etc. |
| **Maps**                | Each game mode is played on a **designated map** (scenario). MVP: one map (`arena-01`)          |
| **Round flow**          | Players fight until **one team is fully eliminated**; **no respawn mid-round**                  |
| **Between rounds**      | All players reset: full HP, respawn at team spawn points, weapons reset                         |
| **Starting loadout**    | **Pistol only** at round start. Knife, rifle, and other weapons — future US                     |
| **Damage**              | Zone-based (head / limbs / body). Difficulty presets scale incoming damage                      |
| **Win condition (MVP)** | When all players on one team are eliminated, the **other team wins** the round                  |

## Functional

| ID    | Requirement                                                                                                                                                                                                                                                                                                                                             |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR-1  | Landing at `/` (`src/pages/index.astro`) shows title **Conter Strai**, tagline, `soldiers.png`, game info (online PvP, **Puma vs Lion**, round-based), **Start Game** → `/play`, footer **Contribute on GitHub** (repo from `package.json`), SEO meta, and a **dark tactical shooter theme** (amber accent, CSS atmosphere, no Three.js on landing) |
| FR-2  | `/play` loads one 3D scenario with floor + walls from texture GLBs                                                                                                                                                                                                                                                                                      |
| FR-3  | Local player moves with **WASD + mouse look** (FPS); pointer lock on click                                                                                                                                                                                                                                                                              |
| FR-4  | Soldier model is data-driven (`swat-guy` default); registry supports future models                                                                                                                                                                                                                                                                      |
| FR-5  | Scenario is data-driven (`arena-01` default); registry supports future maps                                                                                                                                                                                                                                                                             |
| FR-6  | Each soldier has **100 HP** (configurable max) at round start                                                                                                                                                                                                                                                                                           |
| FR-7  | Bullet hits reduce HP by zone: **head 50%**, **limbs 15%**, **body 20%** of max HP                                                                                                                                                                                                                                                                      |
| FR-8  | Difficulty presets adjust incoming damage                                                                                                                                                                                                                                                                                                               |
| FR-9  | At 0 HP, soldier is **eliminated for the current round** — **no respawn until the round ends**                                                                                                                                                                                                                                                          |
| FR-10 | PvP: two teams (**Puma** / **Lion**) fight to eliminate each other                                                                                                                                                                                                                                                                                      |
| FR-11 | Round start: assign team, spawn at team spawn point, equip **pistol**                                                                                                                                                                                                                                                                                   |
| FR-12 | Round end: when **one team is fully eliminated**, declare winner and start next round (respawn all, reset HP)                                                                                                                                                                                                                                           |

## Non-functional

| ID    | Requirement                                                               |
| ----- | ------------------------------------------------------------------------- |
| NFR-1 | Spec before code for each US                                              |
| NFR-2 | Domain logic in `services/` / `utils/` — no Three.js inside pure services |
| NFR-3 | Game island dynamically imported on `/play` to keep landing bundle small  |
| NFR-4 | `prefers-reduced-motion`: disable camera bob / optional effects           |
| NFR-5 | Works in latest Chrome/Firefox/Safari desktop                             |
| NFR-6 | Astro pages + R3F island split — no Three.js on the landing route         |
| NFR-7 | Unit tests for pure domain logic; skip testing Three.js render internals  |
| NFR-8 | Multiplayer via **Colyseus** + Astro **`@astrojs/node`** (server output) — see US-5 |

## Out of scope (MVP)

- Knife, rifle, and additional weapons (pistol only for MVP)
- Bomb defusal, hostage, and other objective modes beyond team elimination
- Matchmaking, ranks, economy, buy menu
- Mobile touch controls
- External BaaS (Colyseus self-hosted on Astro Node; Cloud optional later)
- Playroom Kit (replaced by Colyseus)
