import type { Client } from 'colyseus';
import type { MatchState } from '../schema/match-state';

import type { ScenarioId } from '@/modules/scenarios/types';
import type { Team } from '@/modules/teams/types';
import { Room } from 'colyseus';
import { DEFAULT_MAX_PER_TEAM } from '@/modules/game/constants/play-defaults';
import { getScenarioById } from '@/modules/scenarios/get-scenario-by-id';
import { TEAM_SKINS } from '@/modules/teams/constants/team-skins';
import { createMatchState } from '../schema/match-state';
import { createPlayerState } from '../schema/player-state';
import { isRemotePoseMessage } from '../utils/syncable-remote-pose';
import { applyMatchShot } from './apply-match-shot';
import { assignTeam, checkTeamWipe, teamCount } from './match-teams';
import { placePlayerAtSpawn, resolveTeamSpawn, respawnMatchPlayers } from './place-match-player';

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

const MAX_CLIENTS = DEFAULT_MAX_PER_TEAM * 2;
const COUNTDOWN_START = 3;
const COUNTDOWN_TICK_MS = 1_000;

export class MatchRoom extends Room<{ state: MatchState; metadata: MatchMetadata }> {
  private hostSessionId: string | null = null;
  /** Spawn slot claimed at join — reused on round restart. */
  private spawnIndexBySession = new Map<string, number>();
  private countdownTimer: ReturnType<typeof setInterval> | null = null;
  /** Host close / API dispose — skip the reconnection grace window on teardown. */
  private disposing = false;
  /** Clients that sent `leaveLobby` — skip the reconnect grace on disconnect. */
  private abandonedSessions = new Set<string>();

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

    this.onMessage('startRound', (client) => {
      const phase = this.state.roundPhase;
      if (
        client.sessionId !== this.hostSessionId
        || (phase !== 'waiting' && phase !== 'ended')
      ) {
        return;
      }
      this.startRound();
    });

    this.onMessage('shot', (client, data: { targetId: string; zone: 'head' | 'body' | 'limb' }) => {
      const winner = applyMatchShot(this.state, client.sessionId, data);
      if (winner) {
        this.state.winner = winner;
        this.state.roundPhase = 'ended';
        this.broadcast('roundEnd', { winner });
      }
    });

    // Relay cosmetic local poses to peers (no authority).
    this.onMessage('pose', (client, data: { pose: unknown }) => {
      if (isRemotePoseMessage(data?.pose)) {
        this.broadcast('pose', { sessionId: client.sessionId, pose: data.pose }, { except: client });
      }
    });

    // Relay gunshots for spatial SFX (no authority — damage stays on `shot`).
    this.onMessage('fire', (client) => {
      const player = this.state.players.get(client.sessionId);
      if (!player || player.eliminated || this.state.roundPhase !== 'in_progress') {
        return;
      }
      this.broadcast('fire', { sessionId: client.sessionId }, { except: client });
    });

    this.onMessage('leaveLobby', (client) => {
      if (this.state.roundPhase !== 'waiting') {
        return;
      }
      this.abandonedSessions.add(client.sessionId);
      this.removePlayer(client.sessionId);
    });
  }

  onJoin(client: Client, options?: JoinOptions) {
    if (this.hostSessionId === null) {
      this.hostSessionId = client.sessionId;
    }
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
    const spawnIndex = teamCount(this.state, team);
    const { spawn, yaw } = resolveTeamSpawn(scenario, team, spawnIndex);

    const player = createPlayerState({
      team,
      skin: options?.skin ?? TEAM_SKINS[team][0],
    });
    placePlayerAtSpawn(player, spawn, yaw);
    this.spawnIndexBySession.set(client.sessionId, spawnIndex);

    this.state.players.set(client.sessionId, player);
  }

  /**
   * Hard navigations (waiting → /play) often close the socket with a "normal"
   * code that Colyseus treats as consented. Always hold the seat briefly so
   * `/play` can `client.reconnect` with the persisted token.
   */
  async onLeave(client: Client, _code?: number) {
    if (this.disposing) {
      this.removePlayer(client.sessionId);
      return;
    }
    if (this.abandonedSessions.delete(client.sessionId)) {
      return;
    }
    try {
      await this.allowReconnection(client, 60);
    } catch {
      this.removePlayer(client.sessionId);
    }
  }

  /** Tear down the lobby immediately (host Close Room / DELETE handler). */
  async disposeLobby(): Promise<void> {
    this.disposing = true;
    await this.disconnect();
  }

  private removePlayer(sessionId: string) {
    this.state.players.delete(sessionId);
    this.spawnIndexBySession.delete(sessionId);

    if (sessionId === this.hostSessionId) {
      const remaining = this.state.players.keys().next();
      this.hostSessionId = remaining.done ? null : remaining.value;
    }

    if (this.state.roundPhase === 'in_progress') {
      const winner = checkTeamWipe(this.state);
      if (winner) {
        this.state.winner = winner;
        this.state.roundPhase = 'ended';
        this.broadcast('roundEnd', { winner });
      }
    }
  }

  startRound() {
    respawnMatchPlayers(this.state, this.spawnIndexBySession);
    this.state.winner = '';
    this.state.countdown = COUNTDOWN_START;
    this.state.roundPhase = 'countdown';
    // Reserved seats still connect; only fresh joinById/PUT joins are blocked.
    this.lock();
    this.beginCountdown();
  }

  onDispose() {
    this.clearCountdown();
  }

  private beginCountdown() {
    this.clearCountdown();
    this.countdownTimer = setInterval(() => {
      if (this.state.roundPhase !== 'countdown') {
        this.clearCountdown();
        return;
      }
      if (this.state.countdown <= 1) {
        this.clearCountdown();
        this.state.countdown = 0;
        this.state.roundPhase = 'in_progress';
        return;
      }
      this.state.countdown -= 1;
    }, COUNTDOWN_TICK_MS);
  }

  private clearCountdown() {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = null;
    }
  }
}
