import { scenarios } from '@/modules/scenarios/scenario-registry';

export const SCENARIO_LIST = Object.values(scenarios);

export const SCENARIO_IDS = SCENARIO_LIST.map((scenario) => scenario.id);
