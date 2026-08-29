# US-10 — Tasks

Ship after **US-5** / **US-7** / **US-8** / **US-9** (shipped). Tick only when the matching requirement passes.

See [`design.md`](./design.md) and [`requirements.md`](./requirements.md).

## Server shuffle (US-10.1–US-10.5, US-10.7)

- [x] Add `shuffleTeamsIfNoOpponents(state, rng?)` in `src/modules/multiplayer/rooms/match-teams.ts`
- [x] Add `recalculateSpawnIndices(state, spawnIndexBySession)` in `match-teams.ts`
- [x] Call both from `MatchRoom.startRound()` before `respawnMatchPlayers`
- [x] Unit: solo skip, mixed lobby skip, shuffle splits (2/3/4 players), skin remap, spawn index recalc, seeded RNG

## Client sync (US-10.6)

- [ ] In `bind-match.ts`: sync local `team` / `skin` from server snapshot into `writeRoomSession` when changed

## Spec (on ship)

- [ ] Add FR-42 / FR-43 to `specs/current/requirements.md`
- [ ] Update `specs/current/design.md` § Teams + round sync
- [ ] CHANGELOG row; delete `specs/us-10/`

## Do not

- Rebalance uneven mixed lobbies (e.g. 5v2)
- Add waiting-room team-change UI
- Block solo **Start Match**
- Add shuffle notification toast (optional follow-up)
