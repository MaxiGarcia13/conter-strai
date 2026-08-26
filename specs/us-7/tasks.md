# US-7 — Tasks

Pre-play match lobby (create / join / wait). Requires US-6 skins registered (`remy` / `james` / `liza`, `swat-1` / `swat-2` / `swat-3`).

Do not start implementation until picked up explicitly — checkboxes below are the work queue.

## Spec / queue

- [x] `specs/us-7/` requirements + design + tasks (lobby rewrite)
- [x] Point from [`specs/current/tasks.md`](../current/tasks.md)
- [x] Note on US-4.8: local play respects select team; networked assign may override (US-5)
- [x] Cross-link US-5.3: lobby Play / Create / Join supersedes “Start Game”

## Scenario data

- [x] Optional `previewImageUrl?: string | null` on `ScenarioConfig`
- [x] `arena-01`: set `previewImageUrl` null (or omit); add ≥1 **civilian** east spawn in `teamSpawns`
- [x] Vitest / manual: civilian spawn resolves without throw

## Landing

- [ ] Replace **Start Game** with **Create Room** → `/create` and **Join Room** → `/join` on `src/pages/index.astro`

## Create room (`/create`)

- [ ] `src/pages/create.astro` + React island (client-only for R3F preview)
- [ ] Team toggle: Civilian | Soldier
- [ ] Character list filtered by team; selecting one updates preview
- [ ] Character preview Canvas: selected skin + shared idle, slow yaw/orbit
- [ ] Arena cards from scenario registry: name + image or placeholder
- [ ] Generate local room id; **Create Room** → `/lobby?mode=create&room=&team=&skin=&scenario=`

## Join room (`/join`)

- [ ] `src/pages/join.astro` + React island (client-only for R3F preview)
- [ ] Room code field; team + avatar pickers (same preview as create); no arena pick
- [ ] Prefill room code when opened with `?room=` (invite link)
- [ ] **Join Room** → `/lobby?mode=join&room=&team=&skin=` (scenario default for solo boot)

## Waiting room (`/lobby`)

- [ ] `src/pages/lobby.astro` + island (DOM-only OK)
- [ ] Show room id, local player summary, waiting / empty-slot copy (local-only; no remotes)
- [ ] Shareable invite URL input (`{origin}/join?room=<id>`) + **Copy**
- [ ] QR code for the same invite URL (client-side)
- [ ] **Play** → `/play?team=&skin=&scenario=`
- [ ] Back link to `/create` or `/join` from `mode`

## Play boot

- [ ] Parse `team` / `skin` / `scenario` query params (defaults + team↔skin consistency)
- [ ] `GameCanvas` uses selected `scenarioId` (stop hardcoding only path if still default-only)
- [ ] `resolveLocalSpawn` uses selected **team** (not always `soldier`)
- [ ] `LocalPlayer` uses selected **skin**
- [ ] Playwright: landing → create → lobby → play with civilian/`remy` and soldier/`swat-1` smoke paths
- [ ] Playwright: join path (incl. `?room=` prefill) reaches lobby; invite URL / copy / QR present on lobby

## Out of scope here

- Shared clip pipeline / crouch-walk (shipped US-6)
- Round auto-assign implementation (US-4) beyond the US-4.8 note
- Colyseus rooms / real matchmaking (US-5)
- Host arena sync for joiners (US-5)
- Arena image upload / CDN
- SMS / email invite providers
