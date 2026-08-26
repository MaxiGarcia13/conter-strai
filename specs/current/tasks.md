# Conter Strai — Tasks (current)

Work queue points to open US deltas. Tick tasks in the delta folder; ship into `current/` when acceptance passes.

## Suggested order

US numbers are not execution order. Ship in this sequence:

1. **US-5** — Colyseus multiplayer _(consumes shipped US-7 room routes)_

US-4 (local PvP loop) and **US-7** (match lobby) are **shipped**. Fire **pose clip** on LMB is deferred — see [tech-debt.md](../tech-debt.md).

## Tech debt

- [specs/tech-debt.md](../tech-debt.md) — dead exports, unused scenario scaffolding, dependency hygiene, deferred shooting clip

## Open deltas

- [specs/us-5/tasks.md](../us-5/tasks.md) — Colyseus multiplayer (Astro Node)
