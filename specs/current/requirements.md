# Conter Strai — Requirements (current)

Living product contract. Open deltas extend this until shipped.

## Game rules

Conter Strai is a **round-based team tactical shooter** inspired by Counter-Strike.

| Rule                    | Detail                                                                                                                         |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| **Teams**               | Two sides — **Civilians** vs **Soldiers** — assigned at match/round start                                                      |
| **Objective**           | Eliminate the opposing team (team deathmatch). Future modes may add bomb defusal, capture, etc.                                |
| **Maps**                | Each game mode is played on a **designated map** (scenario). MVP: one map (`arena-01`)                                         |
| **Round flow**          | Players fight until **one team is fully eliminated**; **no respawn mid-round**                                                 |
| **Between rounds**      | All players reset: full HP, respawn at team spawn points, weapons reset                                                        |
| **Starting loadout**    | **Pistol only** at round start. Knife, rifle, and other weapons — future US (each with its own damage profile)                 |
| **Damage**              | Weapon + zone based (head / limbs / body). Each weapon has `damageByZone`; difficulty scales incoming damage. MVP: pistol only |
| **Win condition (MVP)** | When all players on one team are eliminated, the **other team wins** the round                                                 |

## Functional

| ID    | Requirement                                                                                                                                                                                                                                                                                                                                                                              |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR-1  | Landing at `/` (`src/pages/index.astro`) shows title **Conter Strai**, tagline, `cs.png`, game info (online PvP, **Civilians vs Soldiers**, round-based), **Create Room** → `/room` and **Join Room** → `/room/join`, footer **Contribute on GitHub** (repo from `package.json`), SEO meta, and a **dark tactical shooter theme** (amber accent, CSS atmosphere, no Three.js on landing) |
| FR-2  | `/room/{id}/play` loads R3F canvas via dynamic import; scenario from room session (default `arena-01` **Ruined Village**: **100×50 m**, floor/walls from texture registry, optional `props[]`)                                                                                                                                                                                           |
| FR-3  | Local player moves with **WASD + mouse look**; pointer lock on click; outer bounds + interior wall collision (pass only through configured holes)                                                                                                                                                                                                                                        |
| FR-4  | Character skins are data-driven (`SoldierSkinId`); default play skin **`remy`** (Civilians). Civilians: `remy` / `james` / `liza`. Soldiers: `swat-1` / `swat-2` / `swat-3`. Clips load from shared [`base-animations.glb`](../../public/assets/characters/shared/base-animations.glb)                                                                                                   |
| FR-5  | Scenario, texture, prop, and soldier registries are data-driven; new maps/props = config, not new scene components; world units **1 unit = 1 meter**                                                                                                                                                                                                                                     |
| FR-6  | Each soldier has **100 HP** (configurable max) at round start                                                                                                                                                                                                                                                                                                                            |
| FR-7  | Bullet hits reduce HP by **weapon** + zone (MVP pistol: **head 40%**, **body 20%**, **limbs 15%** of max HP)                                                                                                                                                                                                                                                                             |
| FR-8  | Difficulty presets adjust incoming damage                                                                                                                                                                                                                                                                                                                                                |
| FR-9  | At 0 HP, soldier is **eliminated for the current round** — **no respawn until the round ends**                                                                                                                                                                                                                                                                                           |
| FR-10 | PvP: two teams (**Civilians** / **Soldiers**) fight to eliminate each other                                                                                                                                                                                                                                                                                                              |
| FR-11 | Round start: assign team, spawn at team spawn point, equip **pistol**                                                                                                                                                                                                                                                                                                                    |
| FR-12 | Round end: when **one team is fully eliminated**, declare winner (banner with Restart / Home). Next-round respawn / HP reset is host (or offline) Restart — no auto-timer                                                                                                                                                                                                                |
| FR-13 | Scenario defines **team spawn points** — Soldiers west / Civilians east; spawns face map center                                                                                                                                                                                                                                                                                          |
| FR-14 | Three camera modes cycle with **C**: first-person (head bone), over-the-shoulder, third-person; **default is over-the-shoulder**; HUD shows active mode. **Dev only:** **V** toggles a ghost free-cam (WASD + click look, Q/E vertical); production builds omit the DEV chunk                                                                                                            |
| FR-15 | Local soldier plays **idle** / **walk** / **run** (stand / WASD / WASD+Space); **F** jump one-shot (clears kneel first); **E** kneel toggle (works from idle or mid-walk — enters crouch-walk directly if moving). While kneeling, WASD keeps kneel and plays **crouch-walking** at walk speed; WASD+Space runs (stand run clip + speed) and returns to **kneel** when movement stops    |
| FR-16 | Aim: centered HUD crosshair + world look-ray hit marker (skip local player meshes)                                                                                                                                                                                                                                                                                                       |
| FR-17 | FPS: one local clone; camera on head bone; head hidden; look pitch bends spine/arms in all modes                                                                                                                                                                                                                                                                                         |
| FR-18 | Unit tests cover GLB animation contract + clip utilities; E2E smoke confirms room play canvas + soldier/mixer init without binding errors                                                                                                                                                                                                                                                |
| FR-19 | HUD **health bar** shows local player HP %; updates after damage                                                                                                                                                                                                                                                                                                                         |
| FR-20 | Soldiers carry invisible **hitbox** colliders (`head` / `body` / `limb`) tagged for raycast zone resolution                                                                                                                                                                                                                                                                              |
| FR-21 | At 0 HP, **`dying`** animation plays and player controls are disabled until round reset                                                                                                                                                                                                                                                                                                  |
| FR-22 | Pointer-locked **LMB** fires a pistol hitscan from camera center (range 100 m); cooldown from `PistolWeaponConfig.fireCooldownSeconds`; no friendly fire. Fire **pose clip is deferred** — hitscan + SFX only until a shippable `shooting` clip is wired                                                                                                                                 |
| FR-23 | **R** plays **reloading** (stand, idle) or **reloading-kneel**; mixer busy until finished; WASD cancels reload                                                                                                                                                                                                                                                                           |
| FR-24 | Equipped pistol GLB (`pistol_a.glb`) is attached at runtime to the Mixamo **right-hand** bone on the local player and NPCs (not baked into skin meshes)                                                                                                                                                                                                                                  |

## Non-functional

| ID    | Requirement                                                                         |
| ----- | ----------------------------------------------------------------------------------- |
| NFR-1 | Spec before code for each US                                                        |
| NFR-2 | Domain logic in `services/` / `utils/` — no Three.js inside pure services           |
| NFR-3 | Game island dynamically imported on `/room/.../play` to keep landing bundle small   |
| NFR-4 | `prefers-reduced-motion`: disable camera bob / optional effects                     |
| NFR-5 | Works in latest Chrome/Firefox/Safari desktop                                       |
| NFR-6 | Astro pages + R3F island split — no Three.js on the landing route                   |
| NFR-7 | Unit tests for pure domain logic; skip testing Three.js render internals            |
| NFR-8 | Multiplayer via **Colyseus** + Astro **`@astrojs/node`** (server output) — see US-5 |

## Out of scope (MVP)

- Knife, rifle, and additional weapons (pistol only for MVP)
- Soldier **shooting** clip on LMB (mixer can play it; playback deferred — no shippable fire pose yet)
- Bomb defusal, hostage, and other objective modes beyond team elimination
- Matchmaking, ranks, economy, buy menu
- Mobile touch controls
- External BaaS (Colyseus self-hosted on Astro Node; Cloud optional later)
- Playroom Kit (replaced by Colyseus)
