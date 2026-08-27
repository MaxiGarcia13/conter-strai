import type { MatchState } from '../schema/match-state';
import type { HitZone } from '@/modules/combat/types';
import type { Team } from '@/modules/teams/types';
import { applyDamage } from '@/modules/combat/apply-damage';
import { DEFAULT_MAX_HP } from '@/modules/combat/constants/health';

import { checkTeamWipe } from './match-teams';

/** Pure weapon data — no React/three.js imports. */
export const PISTOL_DAMAGE_BY_ZONE = { head: 0.4, body: 0.2, limb: 0.15 } as const;

export interface ShotMessage {
  targetId: string;
  zone: HitZone;
}

/**
 * Apply a validated shot into authoritative match state.
 * Returns the winning team when the shot causes a wipe; otherwise null.
 */
export function applyMatchShot(
  state: MatchState,
  shooterSessionId: string,
  data: ShotMessage,
): Team | null {
  if (state.roundPhase !== 'in_progress') {
    return null;
  }

  const shooter = state.players.get(shooterSessionId);
  if (!shooter || shooter.eliminated) {
    return null;
  }

  const target = state.players.get(data.targetId);
  if (!target || target.eliminated) {
    return null;
  }
  if (target.team === shooter.team) {
    return null;
  }

  const nextHp = applyDamage({
    currentHp: target.hp,
    maxHp: DEFAULT_MAX_HP,
    zone: data.zone,
    difficulty: 'normal',
    damageByZone: PISTOL_DAMAGE_BY_ZONE,
  });

  target.hp = nextHp;
  target.eliminated = nextHp <= 0;

  return checkTeamWipe(state);
}
