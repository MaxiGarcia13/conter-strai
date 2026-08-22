# US-2 — Design

## Registry types

```typescript
type Team = 'argentina' | 'england';

interface ScenarioConfig {
  id: string;
  name: string;
  bounds: { width: number; depth: number; wallHeight: number };
  floor: { assetId: string };
  walls: { assetId: string };
  teamSpawns: Record<Team, [number, number, number][]>;
}

interface SoldierDefinition {
  id: string;
  modelUrl: string;
  scale: number;
}
```

## Components

- `GameCanvas.tsx` — R3F Canvas, lights, camera
- `ScenarioScene.tsx` — floor plane + wall boxes with GLB materials
- `SoldierModel.tsx` — loads swat-guy.glb
- `FpsPlayer.tsx` — camera + movement hook
- `useFpsControls.ts` — WASD, mouse, collision

## arena-01

20×20 m arena, `worn_tile_floor` + `damaged_plaster`.

| Team      | Spawn side | Points   |
| --------- | ---------- | -------- |
| Argentina | West (−X)  | 2 spawns |
| England   | East (+X)  | 2 spawns |

Round start (US-4) picks a spawn per player on their team.
