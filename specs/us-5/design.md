# US-5 — Design

## Adapter

```typescript
// src/modules/multiplayer/adapters/playroom-adapter.ts
initMatch(options) → { room, localPlayerId, players }
syncTransform(id, { x, y, z, rotY })
broadcastShot({ origin, direction })
onPlayerUpdate(callback)
onShotReceived(callback)
```

## Player state (Playroom)

```typescript
{ x: number; y: number; z: number; rotY: number; hp: number; eliminated: boolean }
```

## Integration

- `GameCanvas` calls adapter on mount
- `FpsPlayer` syncs local transform each frame (throttled ~20 Hz)
- `useShooting` broadcasts shot via RPC
- `RemotePlayer` component renders other players' soldiers

## Env

`PUBLIC_PLAYROOM_GAME_ID` in `.env`
