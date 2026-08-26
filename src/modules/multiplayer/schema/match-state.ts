import type { SchemaType } from '@colyseus/schema';
import { MapSchema, schema, t } from '@colyseus/schema';
import { DEFAULT_MAX_PER_TEAM, DEFAULT_SCENARIO_ID } from '@/modules/game/constants/play-defaults';

import { PlayerStateSchema } from './player-state';

export type MatchRoundPhase = 'waiting' | 'in_progress' | 'ended';

/**
 * Authoritative match state — one instance per `MatchRoom`.
 *
 * `roundPhase` maps to client `game/types.RoundPhase` via adapter where useful.
 * `winner` is a team id (`'civilian'` / `'soldier'`) or empty string.
 */
export const MatchStateSchema = schema(
  {
    players: t.map(PlayerStateSchema),
    roundPhase: t.string(),
    winner: t.string(),
    scenario: t.string(),
    maxPerTeam: t.number(),
  },
  'MatchState',
);

export type MatchState = SchemaType<typeof MatchStateSchema>;

export function createMatchState(
  opts: { scenario?: string; maxPerTeam?: number } = {},
): MatchState {
  const state = new MatchStateSchema();
  state.players = new MapSchema();
  state.roundPhase = 'waiting';
  state.winner = '';
  state.scenario = opts.scenario ?? DEFAULT_SCENARIO_ID;
  state.maxPerTeam = opts.maxPerTeam ?? DEFAULT_MAX_PER_TEAM;
  return state;
}
