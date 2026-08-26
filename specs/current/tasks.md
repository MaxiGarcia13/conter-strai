# Conter Strai — Tasks (current)

Work queue points to open US deltas. Tick tasks in the delta folder; ship into `current/` when acceptance passes.

## Suggested order

US numbers are not execution order. Ship in this sequence:

1. **US-7** — match select _(uses shipped US-6 skins; local round respects select when play boot lands)_
2. **US-5** — Colyseus multiplayer

US-4 (local PvP loop) is **shipped**. Fire **pose clip** on LMB is deferred — see [tech-debt.md](../tech-debt.md).

## Tech debt

- [specs/tech-debt.md](../tech-debt.md) — dead exports, unused scenario scaffolding, dependency hygiene, deferred shooting clip

## Open deltas

- [specs/us-5/tasks.md](../us-5/tasks.md) — Colyseus multiplayer (Astro Node)
- [specs/us-7/tasks.md](../us-7/tasks.md) — Match select (team / character / arena)
