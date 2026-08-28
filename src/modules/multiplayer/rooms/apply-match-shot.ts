import type { MatchState } from '../schema/match-state';
import type { HitZone } from '@/modules/combat/types';
import type { Team } from '@/modules/teams/types';
import { applyDamage } from '@/modules/combat/apply-damage';
import { DEFAULT_MAX_HP } from '@/modules/combat/constants/health';
import { PISTOL_DAMAGE_BY_ZONE, PISTOL_MAX_RANGE_METERS } from '@/modules/weapons/constants/pistol';

import { checkTeamWipe } from './match-teams';

export interface ShotMessage {
  targetId: string;
  zone: HitZone;
}

const HIT_ZONES: ReadonlySet<HitZone> = new Set(['head', 'body', 'limb']);

/** Runtime shape guard for the `shot` wire message. */
export function isShotMessage(value: unknown): value is ShotMessage {
  if (value === null || typeof value !== 'object') {
    return false;
  }
  const message = value as Partial<ShotMessage>;
  return (
    typeof message.targetId === 'string'
    && message.targetId.length > 0
    && (typeof message.zone === 'string' && HIT_ZONES.has(message.zone as HitZone))
  );
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

  // Ground-plane range from authoritative Schema positions.
  if (
    Math.hypot(target.x - shooter.x, target.z - shooter.z)
    > PISTOL_MAX_RANGE_METERS
  ) {
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
