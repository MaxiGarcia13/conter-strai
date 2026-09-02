# Changelog

## How it works

- One row per **shipped** user story (US-N), not per task.
- Cross-cutting refactors (architecture, tech-debt passes) get a row under **Shipped — other** when closed.
- Open work lives in `specs/us-<n>/` until folded into `specs/current/`.
- On ship: merge delta into `current/`, add a row here, delete the delta folder.

## Open

None.

## Shipped

| US | Summary |
|----|---------|
| **US-15** | Multiple openings per wall + `along` offset — `holes[]` door/window specs; single `hole` shorthand stays centered |
| **US-14** | Wall windows — partial-height house wall openings (configurable width/height); doors stay passable; arena-01 placement |
| **US-13** | Pistol magazine reload (12 rounds, manual refill, ammo HUD), mobile reload button (`ReloadIcon`), client-only close-range (~10 m) black wall impact marks |
| **US-12** | Mobile touch controls — modular input layer, virtual joystick, look zone, fire/kneel/sprint buttons, top-bar pause + health HUD, camera cycle from pause menu |
| **US-11** | Arena modularization (Ruined Village polish) — composable `arena-01`, collidable props, house presets, sky/fog, open perimeter, non-overlapping floors |
| **US-10** | Shuffle teams when lobby has no opponents — even split on `startRound` if one team is empty; skip mixed/solo; skin remap + spawn recalc; client session sync |
| **US-9** | Pause menu (Esc), look without pre-click, deploy-ready countdown gate (`deploying` → all `playerReady` → 3‑2‑1) |
| **US-8** | Server security — host token, origin guard, shot/move validation, room TTL (40 min, renew on restart) |
| **US-1** | Landing page — hero, soldiers art, Create Room / Join Room CTAs, GitHub contribute footer, shooter theme, SEO |
| **US-2** | 3D arena (`arena-01`), FPS/OTS/TPS cameras, locomotion + jump/kneel, interior collision, aim HUD |
| **US-3** | Health & zone damage — weapon profiles, hitboxes, HUD bar, round-permanent elimination + `dying` clip |
| **US-4** | Local PvP loop — pistol hitscan, teams, wipe banner, hand-attached pistol, reload clips. **`shooting` pose on LMB deferred** (no shippable fire clip) |
| **US-5** | Colyseus multiplayer (Astro Node adapter) + REST lobby + team rounds + pose relay + spatial combat SFX |
| **US-6** | Shared animation pack, six skins (`remy` / `james` / `liza` + `swat-1` / `swat-2` / `swat-3`), crouch-walk |
| **US-7** | Match lobby — `/room` create / join / wait / play; sessionStorage; invite URL + QR; team/skin/arena boot (legacy `/play` removed) |

## Shipped — other

| Date | Item | Summary |
|------|------|---------|
| 2026-08-23 | Type split | Module type domains; one `types.ts` per module; `ScenarioConfig` flat composition; `SoldierSkin` + `hitboxPresetId`; hitbox types/registry in `combat/`. See [current/design.md](./current/design.md#module-types). |
| 2026-08-28 | Improvements polish | Dark-cloth lighting (IBL/fill), kneel-from-walk, remote pose relay, spatial combat SFX, backward locomotion + reload/jump-idle sync. See [improvements.md](./improvements.md). |
| 2026-08-31 | Staged arena deploy | Phased Suspense mount (ground → houses → props → character); deferred controls + HUD; lazy deploy loader. See [improvements.md §6](./improvements.md#6-staged-arena-deploy--deferred-gameplay-chrome-shipped) and [design.md § Staged arena deploy](./current/design.md#staged-arena-deploy). |
| 2026-08-31 | Landing & shell polish | Self-hosted fonts (Barlow Condensed + Share Tech Mono); shared `SiteTopbar` / `CsButton` on landing + lobby; `APP_VERSION` in footer + pause panel; arena preview image on create room; README landing screenshot (`docs/landing.webp`). |
| 2026-08-31 | Dependency hygiene | Remove unused `@colyseus/react` — matchmaking uses `@colyseus/sdk` directly. See [tech-debt.md](./tech-debt.md). |
| 2026-08-31 | Match size 3v3 | Cap rooms at 3 per side (6 players); `DEFAULT_MAX_PER_TEAM` is the single source of truth. |
