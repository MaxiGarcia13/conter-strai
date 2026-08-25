# Conter Strai — Tasks (current)

Work queue points to open US deltas. Tick tasks in the delta folder; ship into `current/` when acceptance passes.

## Suggested order

US numbers are not execution order. Ship in this sequence:

1. **US-4** — PvP loop (round service + shooting; fire/reload clips on shared pack)
2. **US-7** — match select _(uses shipped US-6 skins)_
3. **US-5** — Colyseus multiplayer

US-6 (shared animations + six skins + crouch-walk) is **shipped**. Weapon mesh attach and pose clips (US-4.9–4.11) can proceed.

## Tech debt

- [specs/tech-debt.md](../tech-debt.md) — dead exports, unused scenario scaffolding, dependency hygiene

## Open deltas

- [specs/us-4/tasks.md](../us-4/tasks.md) — PvP shooting
- [specs/us-5/tasks.md](../us-5/tasks.md) — Colyseus multiplayer (Astro Node)
- [specs/us-7/tasks.md](../us-7/tasks.md) — Match select (team / character / arena)
