import type { Client } from 'colyseus';
import type { MatchState } from '../schema/match-state';

import type { ScenarioId } from '@/modules/scenarios';
import type { Team } from '@/modules/teams';
import { Room } from 'colyseus';
import { applyDamage } from '@/modules/combat/apply-damage';
import { DEFAULT_MAX_HP } from '@/modules/combat/constants/health';
import { DEFAULT_MAX_PER_TEAM } from '@/modules/game/constants/play-defaults';
import { getScenarioById, spawnYawFor } from '@/modules/scenarios';

import { opposingTeam, TEAM_SKINS, TEAMS } from '@/modules/teams';
import { createMatchState } from '../schema/match-state';
import { createPlayerState } from '../schema/player-state';

// Pure weapon data — no React/three.js imports.
const PISTOL_DAMAGE_BY_ZONE = { head: 0.4, body: 0.2, limb: 0.15 } as const;

export interface MatchMetadata {
  roomCode: string;
  scenario: ScenarioId;
}

interface JoinOptions {
  team?: Team;
  skin?: string;
}

interface MoveMessage {
  x: number;
  y: number;
  z: number;
  rotY: number;
}

interface ShotMessage {
  targetId: string;
  zone: 'head' | 'body' | 'limb';
}

const MAX_CLIENTS = DEFAULT_MAX_PER_TEAM * 2;
const ROUND_RESET_DELAY_MS = 3_000;

function teamCount(state: MatchState, team: Team): number {
  let count = 0;
  for (const [, player] of state.players) {
    if (player.team === team) {
      count++;
    }
  }
  return count;
}

function assignTeam(state: MatchState, preferred?: Team): Team | null {
  if (preferred) {
    if (teamCount(state, preferred) < DEFAULT_MAX_PER_TEAM) {
      return preferred;
    }
  }
  for (const team of TEAMS) {
    if (teamCount(state, team) < DEFAULT_MAX_PER_TEAM) {
      return team;
    }
  }
  return null;
}

function checkTeamWipe(state: MatchState): Team | null {
  for (const team of TEAMS) {
    let hasAlive = false;
    for (const [, player] of state.players) {
      if (player.team === team && !player.eliminated) {
        hasAlive = true;
        break;
      }
    }
    if (!hasAlive) {
      return opposingTeam(team);
    }
  }
  return null;
}

export class MatchRoom extends Room<{ state: MatchState; metadata: MatchMetadata }> {
  private roundResetTimer: ReturnType<typeof setTimeout> | null = null;

  onCreate(options: { metadata?: MatchMetadata }) {
    const meta = options.metadata ?? { roomCode: '', scenario: 'arena-01' as ScenarioId };
    this.maxClients = MAX_CLIENTS;
    this.state = createMatchState({ scenario: meta.scenario });
    this.metadata = meta;

    this.onMessage('move', (_client, data: MoveMessage) => {
      const player = this.state.players.get(_client.sessionId);
      if (!player || this.state.roundPhase !== 'in_progress') {
        return;
      }
      player.x = data.x;
      player.y = data.y;
      player.z = data.z;
      player.rotY = data.rotY;
    });

    this.onMessage('shot', (_client, data: ShotMessage) => {
      if (this.state.roundPhase !== 'in_progress') {
        return;
      }
      const shooter = this.state.players.get(_client.sessionId);
      if (!shooter || shooter.eliminated) {
        return;
      }

      const target = this.state.players.get(data.targetId);
      if (!target || target.eliminated) {
        return;
      }
      if (target.team === shooter.team) {
        return;
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

      const winner = checkTeamWipe(this.state);
      if (winner) {
        this.state.winner = winner;
        this.state.roundPhase = 'ended';
        this.broadcast('roundEnd', { winner });
        this.scheduleRoundReset();
      }
    });
  }

  onJoin(client: Client, options?: JoinOptions) {
    if (this.state.players.size >= MAX_CLIENTS) {
      throw new Error('Room is full');
    }

    const team = assignTeam(this.state, options?.team);
    if (!team) {
      throw new Error('Both teams are full');
    }

    if (this.state.roundPhase !== 'waiting') {
      throw new Error('Round in progress');
    }

    const scenario = getScenarioById(this.state.scenario as ScenarioId);
    const spawns = scenario.teamSpawns[team];
    const spawnIndex = this.countTeamMembers(team);
    const spawn = spawns?.[spawnIndex % (spawns?.length ?? 1)] ?? [0, 0, 0];
    const yaw = spawnYawFor(scenario, team, spawn);

    const player = createPlayerState({
      team,
      skin: options?.skin ?? TEAM_SKINS[team][0],
    });
    player.x = spawn[0];
    player.y = spawn[1];
    player.z = spawn[2];
    player.rotY = yaw;

    this.state.players.set(client.sessionId, player);
  }

  onLeave(client: Client) {
    this.state.players.delete(client.sessionId);

    if (this.state.roundPhase === 'in_progress') {
      const winner = checkTeamWipe(this.state);
      if (winner) {
        this.state.winner = winner;
        this.state.roundPhase = 'ended';
        this.broadcast('roundEnd', { winner });
        this.scheduleRoundReset();
      }
    }
  }

  startRound() {
    for (const [, player] of this.state.players) {
      player.hp = DEFAULT_MAX_HP;
      player.eliminated = false;
    }
    this.state.winner = '';
    this.state.roundPhase = 'in_progress';
  }

  onDispose() {
    if (this.roundResetTimer) {
      clearTimeout(this.roundResetTimer);
    }
  }

  private scheduleRoundReset() {
    if (this.roundResetTimer) {
      clearTimeout(this.roundResetTimer);
    }
    this.roundResetTimer = setTimeout(() => {
      this.startRound();
    }, ROUND_RESET_DELAY_MS);
  }

  private countTeamMembers(team: Team): number {
    let count = 0;
    for (const [, player] of this.state.players) {
      if (player.team === team) {
        count++;
      }
    }
    return count;
  }
}
