# US-2 — Design

## Registry types

```typescript
type ScenarioConfig = {
  id: string;
  name: string;
  bounds: { width: number; depth: number; wallHeight: number };
  floor: { assetId: string };
  walls: { assetId: string };
  spawnPoints: [number, number, number][];
};

type SoldierDefinition = {
  id: string;
  modelUrl: string;
  scale: number;
};
```

## Components

- `GameCanvas.tsx` — R3F Canvas, lights, camera
- `ScenarioScene.tsx` — floor plane + wall boxes with GLB materials
- `SoldierModel.tsx` — loads swat-guy.glb
- `FpsPlayer.tsx` — camera + movement hook
- `useFpsControls.ts` — WASD, mouse, collision

## arena-01

20×20 m arena, `worn_tile_floor` + `damaged_plaster`, 4 spawn points.
