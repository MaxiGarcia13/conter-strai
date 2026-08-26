import type { SoldierSkinId } from '@/modules/soldiers';
import type { Team } from '@/modules/teams';

export const TEAM_SKINS: Record<Team, readonly SoldierSkinId[]> = {
  civilian: ['remy', 'james', 'liza'],
  soldier: ['swat-1', 'swat-2', 'swat-3'],
} as const;
