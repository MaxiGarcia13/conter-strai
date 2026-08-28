# US-10 — Design

## Problem

Players pick a team at create/join. If everyone chooses the same side, the lobby has **no opponents** — friendly fire is blocked and the round cannot be won via team wipe.

Design already notes _"random or balanced split"_ ([`specs/current/design.md`](../current/design.md) § Teams) but join-time `assignTeam` only honors preference + overflow fallback; it does not split an all-one-team lobby at match start.

## Rule

```
on startRound:
  if playerCount >= 2 AND one team has 0 players:
    shuffleTeamsIfNoOpponents()
    recalculateSpawnIndices()
  respawnMatchPlayers()
```

| Situation               | Action                  |
| ----------------------- | ----------------------- |
| 1 player, no opponents  | Skip                    |
| 4 civilians, 0 soldiers | Shuffle → e.g. 2v2      |
| 3 civilians, 1 soldier  | Skip — opponents exist  |
| 5v2                     | Skip — uneven but mixed |

## Server

### New helpers in [`match-teams.ts`](../../src/modules/multiplayer/rooms/match-teams.ts)

**`shuffleTeamsIfNoOpponents(state, rng = Math.random): boolean`**

1. Return `false` if `playerCount < 2` or both teams have ≥ 1 player.
2. Fisher–Yates shuffle all `sessionId`s (injectable `rng` for unit tests).
3. Pick `majorTeam` at random (`civilian` \| `soldier`); assign first `ceil(n/2)` shuffled IDs to `majorTeam`, remainder to `opposingTeam(majorTeam)`.
4. Remap `skin` when invalid for new team.
5. Return `true` when shuffle ran.

**`recalculateSpawnIndices(state, spawnIndexBySession)`**

- Per team, sort session IDs deterministically; assign spawn slots `0..count-1`.

### [`match-room.ts`](../../src/modules/multiplayer/rooms/match-room.ts)

In `startRound()`:

```ts
if (shuffleTeamsIfNoOpponents(this.state)) {
  recalculateSpawnIndices(this.state, this.spawnIndexBySession);
}
respawnMatchPlayers(this.state, this.spawnIndexBySession);
```

Rematches: after first shuffle both teams are occupied → subsequent `startRound` skips shuffle.

## Client

[`bind-match.ts`](../../src/modules/multiplayer/services/bind-match.ts): on `onPlayerUpdate`, if local player snapshot `team` / `skin` differs from `readRoomSession(roomId)`, call `writeRoomSession`.

`applyLocalRoundRespawn` already snaps position from server on countdown; session sync fixes stale skin/team props for `LocalPlayer` and spawn preview.

## Tests

| Layer | Target                                                                                          |
| ----- | ----------------------------------------------------------------------------------------------- |
| Unit  | `shuffleTeamsIfNoOpponents`: solo skip, mixed skip, 2→1v1, 3→2v1, 4→2v2, skin remap, seeded RNG |
| Unit  | `recalculateSpawnIndices`: sequential slots per team                                            |

## Ship checklist

Fold into [`specs/current/`](../current/):

- **FR-42** — shuffle on `startRound` when no opponents
- **FR-43** — skin remap on shuffle
- Update § Teams and round-sync in [`design.md`](../current/design.md)
- CHANGELOG row; delete `specs/us-10/`
