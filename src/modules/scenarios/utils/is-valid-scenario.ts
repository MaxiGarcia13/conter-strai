import { SCENARIO_IDS } from '../constants/scenarios';

export function isValidScenario(scenario: unknown): scenario is typeof SCENARIO_IDS[number] {
  return typeof scenario === 'string'
    && SCENARIO_IDS.includes(scenario as typeof SCENARIO_IDS[number]);
}
