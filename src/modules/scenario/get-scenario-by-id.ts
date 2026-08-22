import type { ScenarioConfig, ScenarioId } from './types';
import { scenarios } from './scenario-registry';

export function getScenarioById(id: string): ScenarioConfig {
  if (!(id in scenarios)) {
    throw new Error(`Unknown scenario id: ${id}`);
  }
  return scenarios[id as ScenarioId];
}
