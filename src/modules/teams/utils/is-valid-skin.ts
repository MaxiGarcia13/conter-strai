import type { Team } from '../types';
import { TEAM_SKINS } from '../constants/team-skins';

export function isValidSkin(skin: unknown): skin is (typeof TEAM_SKINS)[keyof typeof TEAM_SKINS][number] {
  const teams = Object.keys(TEAM_SKINS);

  return teams
    .some(
      (team) => TEAM_SKINS[team as Team].includes(skin as (typeof TEAM_SKINS)[keyof typeof TEAM_SKINS][number]),
    );
}
