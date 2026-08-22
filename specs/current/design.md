# Conter Strai — Design (current)

## Stack

- **Astro 7** — pages, layout, SSG shell
- **Three.js** via **@react-three/fiber** + **drei** — game island on `/play`
- **Zustand** — game session, health, players
- **Tailwind 4** — landing UI + HUD
- **Playroom Kit** — real-time multiplayer (US-5)

## Module map

```
src/modules/
├── landing/      Hero, game info, Start Game CTA
├── game/         Session shell, GameCanvas, FPS controls, HUD
├── scenario/     Config-driven maps (arena-01)
├── soldier/      Soldier registry, model, hitboxes
├── combat/       HP, zone damage, difficulty
└── multiplayer/  Playroom adapter (US-5)
```

## Routes

| Route | Owner |
|-------|-------|
| `/` | Astro landing — no Three.js |
| `/play` | Astro shell + R3F `GameCanvas` island (`client:load`) |

## Data flow (combat)

```
useShooting (raycast) → hit zone from mesh userData
  → applyDamage (service) → health store → HUD
  → isEliminated → disable controls → respawn timer
```

## Multiplayer (US-5)

Playroom adapter syncs `{ x, y, z, rotY, hp, eliminated }` per player.
Shooter-authoritative hitscan via RPC.
