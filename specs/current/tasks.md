# Conter Strai — Tasks (current)

Work queue points to open US deltas. Tick tasks in the delta folder; ship into `current/` when acceptance passes.

## Suggested order

US numbers are not execution order. Ship in this sequence:

1. **US-3** — finish remaining (health bar, elimination, `dying` clip)
2. **US-6** — shared animations + `remy` / `swat-1` + crouch-walk *(before US-4 weapon poses and pistol attach)*
3. **US-4** — PvP loop (round service + shooting; fire/reload clips on shared pack after US-6)
4. **US-7** — match select *(requires US-6 skins)*
5. **US-5** — Colyseus multiplayer

Round service and hitscan (US-4) can start in parallel with US-6, but weapon mesh attach and pose clips (US-4.9–4.11) should wait for US-6.

## Tech debt

- [specs/tech-debt.md](../tech-debt.md) — dead exports, unused scenario scaffolding, dependency hygiene

## Open deltas

- [specs/us-3/tasks.md](../us-3/tasks.md) — Health & damage
- [specs/us-4/tasks.md](../us-4/tasks.md) — PvP shooting
- [specs/us-5/tasks.md](../us-5/tasks.md) — Colyseus multiplayer (Astro Node)
- [specs/us-6/tasks.md](../us-6/tasks.md) — Shared animations + crouch-walk
- [specs/us-7/tasks.md](../us-7/tasks.md) — Match select (team / character / arena)
