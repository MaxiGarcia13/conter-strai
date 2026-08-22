# US-5 — Design

## Adapter

```
// src/modules/multiplayer/adapters/playroom-adapter.ts
initMatch(options) → { room, localPlayerId, players }
syncTransform(id, { x, y, z, rotY, team, hp, eliminated })
broadcastShot({ origin, direction })
onPlayerUpdate(callback)
onShotReceived(callback)
syncRoundState(state) // host-authoritative round start/end
```

## Player state (Playroom)

```ts
{
  x: number;
  y: number;
  z: number;
  rotY: number;
  hp: number;
  eliminated: boolean;
  team: 'argentina' | 'england';
}
```

## Round sync

- Host runs `checkRoundEnd` and broadcasts round end when one team is wiped
- Broadcast `{ winner: Team }` on round end
- All clients reset HP and respawn on round start event
- Team assignment synced at round start

## Integration

- `GameCanvas` calls adapter on mount
- `FpsPlayer` syncs local transform each frame (throttled ~20 Hz)
- `useShooting` broadcasts shot via RPC; hits only opposing team
- `RemotePlayer` component renders other players' soldiers

## Env

`PUBLIC_PLAYROOM_GAME_ID` in `.env`
