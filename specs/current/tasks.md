# Conter Strai — Tasks (current)

Work queue points to open US deltas. Tick tasks in the delta folder; ship into `current/` when acceptance passes.

## Suggested order

US numbers are not execution order. Ship in this sequence:

1. **US-10** — Shuffle teams when lobby has no opponents

US-4 (local PvP loop), **US-5** (Colyseus multiplayer), **US-7** (match lobby), **US-8** (server security), and the [improvements backlog](../improvements.md) polish pass are **shipped**. Fire **pose clip** on LMB is deferred — see [tech-debt.md](../tech-debt.md).

## Tech debt

- [specs/tech-debt.md](../tech-debt.md) — dead exports, unused scenario scaffolding, dependency hygiene, deferred shooting clip, lobby REST handler tests, lobby rejoin after browser back

## Open deltas

- [specs/us-10/tasks.md](../us-10/tasks.md) — Shuffle teams when lobby has no opponents
