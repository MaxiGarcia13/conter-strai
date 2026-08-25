# US-7 — Tasks

Pre-play match select. Requires US-6 skins registered (`remy`, `swat-1`).

## Spec / queue

- [x] `specs/us-7/` requirements + design + tasks
- [x] Point from [`specs/current/tasks.md`](../current/tasks.md)
- [x] Note on US-4.8: local play respects select team; networked assign may override (US-5)

## Scenario data

- [ ] Optional `previewImageUrl?: string | null` on `ScenarioConfig`
- [ ] `arena-01`: set `previewImageUrl` null (or omit); add ≥1 **civilian** east spawn in `teamSpawns`
- [ ] Vitest / manual: civilian spawn resolves without throw

## Select page

- [ ] `src/pages/select.astro` + React island (client-only for R3F preview)
- [ ] Landing **Start Game** → `/select`
- [ ] Team toggle: Civilian | Soldier
- [ ] Character list filtered by team; selecting one updates preview
- [ ] Character preview Canvas: selected skin + shared idle, slow yaw/orbit
- [ ] Arena list from scenario registry; name + image or placeholder
- [ ] **Play** → `/play?team=&skin=&scenario=`

## Play boot

- [ ] Parse `team` / `skin` / `scenario` query params (defaults + team↔skin consistency)
- [ ] `GameCanvas` uses selected `scenarioId` (stop hardcoding only path if still default-only)
- [ ] `resolveLocalSpawn` uses selected **team** (not always `soldier`)
- [ ] `LocalPlayer` uses selected **skin**
- [ ] Playwright: landing → select → play with civilian/`remy` and soldier/`swat-1` smoke paths

## Out of scope here

- Shared clip pipeline / crouch-walk (US-6)
- Round auto-assign implementation (US-4) beyond the US-4.8 note
- Colyseus lobby (US-5)
- Arena image upload / CDN
