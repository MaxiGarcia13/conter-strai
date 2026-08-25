# Changelog

## How it works

- One row per **shipped** user story (US-N), not per task.
- Cross-cutting refactors (architecture, tech-debt passes) get a row under **Shipped — other** when closed.
- Open work lives in `specs/us-<n>/` until folded into `specs/current/`.
- On ship: merge delta into `current/`, add a row here, delete the delta folder.

## Open

| US | Summary |
|----|---------|
| **US-4** | Round-based PvP — pistol, teams, eliminate opposing team to win |
| **US-5** | Colyseus multiplayer (Astro Node adapter) + team rounds |
| **US-7** | Match select (team / character / arena) |

## Shipped

| US | Summary |
|----|---------|
| **US-1** | Landing page — hero, soldiers art, Start Game CTA, GitHub contribute footer, shooter theme, SEO |
| **US-2** | 3D arena (`arena-01`), FPS/OTS/TPS cameras, locomotion + jump/kneel, interior collision, aim HUD |
| **US-3** | Health & zone damage — weapon profiles, hitboxes, HUD bar, round-permanent elimination + `dying` clip |
| **US-6** | Shared animation pack, six skins (`remy` / `james` / `liza` + `swat-1` / `swat-2` / `swat-3`), crouch-walk |

## Shipped — other

| Date | Item | Summary |
|------|------|---------|
| 2026-08-23 | Type split | Module type domains; one `types.ts` per module; `ScenarioConfig` flat composition; `SoldierSkin` + `hitboxPresetId`; hitbox types/registry in `combat/`. See [current/design.md](./current/design.md#module-types). |
