# US-7 — Tasks

Pre-play match lobby (create / join / wait). Requires US-6 skins registered (`remy` / `james` / `liza`, `swat-1` / `swat-2` / `swat-3`).

Room-centric routes: `/room`, `/room/join`, `/room/[roomId]`, `/room/[roomId]/join`, `/room/[roomId]/play`. Legacy `/play` kept for e2e until migrated.

## Spec / queue

- [x] `specs/us-7/` requirements + design + tasks (lobby rewrite)
- [x] Point from [`specs/current/tasks.md`](../current/tasks.md)
- [x] Note on US-4.8: local play respects select team; networked assign may override (US-5)
- [x] Cross-link US-5.3: lobby Play / Create / Join supersedes “Start Game”
- [x] Room-centric routing rewrite (`/room` … `/play` under room id; invite = `/room/{id}/join`; sessionStorage)

## Scenario data

- [x] Optional `previewImageUrl?: string | null` on `ScenarioConfig`
- [x] `arena-01`: set `previewImageUrl` null (or omit); add ≥1 **civilian** east spawn in `teamSpawns`
- [x] Vitest / manual: civilian spawn resolves without throw

## Landing

- [x] **Create Room** → `/room` (migrate off `/create` if still present)
- [x] **Join Room** → `/room/join` (room id entered on the join page, not landing)

## Create room (`/room`)

- [x] `src/pages/room/index.astro` + React island (client-only for R3F preview); retire `/create` redirect or remove
- [x] Team toggle: Civilian | Soldier
- [x] Character list filtered by team; selecting one updates preview
- [x] Character preview Canvas: selected skin + shared idle, slow yaw/orbit
- [x] Arena cards from scenario registry: name + image or placeholder
- [x] Generate local room id; write `sessionStorage` (`role: 'host'`); navigate to `/room/{roomId}`

## Join room (`/room/join` and `/room/[roomId]/join`)

- [x] `src/pages/room/join.astro` + `src/pages/room/[roomId]/join.astro` + React island (client-only for R3F preview)
- [x] Room id: field on `/room/join`; path param (shown) on `/room/[roomId]/join`
- [x] Team + avatar pickers (same preview as create); no arena pick
- [x] Write session (`role: 'guest'`); navigate to `/room/{roomId}`

## Waiting room (`/room/[roomId]`)

- [x] `src/pages/room/[roomId]/index.astro` + island (DOM-only OK)
- [x] Show room id, local player summary from session, waiting / empty-slot copy (local-only; no remotes)
- [x] Shareable invite URL input (`{origin}/room/{roomId}/join`) + **Copy**
- [x] QR code for the same invite URL (client-side)
- [x] **Play** → `/room/{roomId}/play`
- [x] Back link to `/room` when host

## Play boot

- [ ] `src/pages/room/[roomId]/play.astro` — read session for `roomId` (defaults + team↔skin consistency)
- [ ] `GameCanvas` uses selected `scenarioId` (stop hardcoding only path if still default-only)
- [ ] `resolveLocalSpawn` uses selected **team** (not always `soldier`)
- [ ] `LocalPlayer` uses selected **skin**
- [ ] Keep legacy `/play` for e2e/dev until room Playwright paths land
- [ ] Playwright: landing → `/room` → wait → play with civilian/`remy` and soldier/`swat-1` smoke paths
- [ ] Playwright: join via `/room/{id}/join` reaches waiting; invite URL / copy / QR present

## Out of scope here

- Shared clip pipeline / crouch-walk (shipped US-6)
- Round auto-assign implementation (US-4) beyond the US-4.8 note
- Colyseus rooms / real matchmaking (US-5)
- Host arena sync for joiners (US-5)
- Arena image upload / CDN
- SMS / email invite providers
- Removing legacy `/play`
