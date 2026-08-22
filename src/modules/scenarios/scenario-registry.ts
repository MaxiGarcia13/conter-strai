import type { ScenarioConfig, ScenarioId } from './types';
import { arena01 } from './maps';

export const scenarios: Record<ScenarioId, ScenarioConfig> = {
  'arena-01': arena01,
};
