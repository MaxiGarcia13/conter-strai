# Changelog

## How it works

- One row per **shipped** user story (US-N), not per task.
- Cross-cutting refactors (architecture, tech-debt passes) get a row under **Shipped — other** when closed.
- Open work lives in `specs/us-<n>/` until folded into `specs/current/`.
- On ship: merge delta into `current/`, add a row here, delete the delta folder.

## Open

| US | Summary |
|----|---------|
| **US-2** | 3D arena scenario + FPS movement + team spawns |
| **US-3** | Zone-based health & difficulty damage (round-permanent elimination) |
| **US-4** | Round-based PvP — pistol, teams, eliminate opposing team to win |
| **US-5** | Colyseus multiplayer (Astro Node adapter) + team rounds |

## Shipped

| US | Summary |
|----|---------|
| **US-1** | Landing page — hero, soldiers art, Start Game CTA, GitHub contribute footer, shooter theme, SEO |

## Shipped — other

| Date | Item | Summary |
|------|------|---------|
| 2026-08-23 | Type split | Module type domains; one `types.ts` per module; `ScenarioConfig` flat composition; `SoldierSkin` + `hitboxPresetId`; hitbox types/registry in `combat/`. See [current/design.md](./current/design.md#module-types). |
