import type { ScenarioId } from '@/modules/scenarios/types';
import type { SoldierSkinId } from '@/modules/soldiers/types';
import type { Team } from '@/modules/teams';

/** Shared play/session defaults — keep lobby, game, and multiplayer schema in sync. */
export const DEFAULT_TEAM = 'civilian' as const satisfies Team;
export const DEFAULT_PLAY_SKIN_ID = 'remy' as const satisfies SoldierSkinId;
export const DEFAULT_SCENARIO_ID = 'arena-01' as const satisfies ScenarioId;
export const DEFAULT_ROOM_ROLE = 'guest' as const;
export const DEFAULT_MAX_PER_TEAM = 3;
export type MaxPerTeam = typeof DEFAULT_MAX_PER_TEAM;
