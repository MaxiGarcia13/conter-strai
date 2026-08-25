export type Team = 'civilian' | 'soldier';

/** HUD / landing labels for `Team` ids. */
export const TEAM_DISPLAY_NAME: Record<Team, string> = {
  civilian: 'Civilians',
  soldier: 'Soldiers',
};
