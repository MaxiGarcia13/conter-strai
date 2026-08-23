import type { ArenaEnvironment } from './environment';
import type { ArenaLayout } from './layout';
import type { SpawnerConfig } from './spawner';

export type ScenarioId = 'arena-01';

export interface ScenarioMeta {
  id: ScenarioId;
  name: string;
  theme?: string;
}

export type ScenarioConfig = ScenarioMeta & ArenaLayout & SpawnerConfig & ArenaEnvironment;
