import type { HealthSystem } from '@/modules/combat';
import type { EntityId } from '@/modules/soldiers';
import type { Team } from '@/modules/teams';
import { opposingTeam, TEAMS } from '@/modules/teams';

export interface RosterEntry {
  entityId: EntityId;
  team: Team;
}

export interface CheckRoundEndInput {
  roster: RosterEntry[];
  healthSystem: HealthSystem;
}

export interface CheckRoundEndResult {
  ended: boolean;
  winner?: Team;
}

/**
 * Pure check: if all soldiers or all civilians are eliminated the round is over.
 * Returns the winning team (the side that still has survivors).
 */
export function checkRoundEnd({ roster, healthSystem }: CheckRoundEndInput): CheckRoundEndResult {
  for (const team of TEAMS) {
    const members = roster.filter((entry) => entry.team === team);
    if (members.length === 0) {
      continue;
    }
    const allEliminated = members.every((entry) => {
      const hp = healthSystem.getHealth(entry.entityId);
      return hp?.isEliminated ?? false;
    });
    if (allEliminated) {
      return { ended: true, winner: opposingTeam(team) };
    }
  }

  return { ended: false };
}
