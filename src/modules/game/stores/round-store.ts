import type { RoundPhase } from '../types';
import type { RosterEntry } from '../utils/check-round-end';
import type { ScenarioId } from '@/modules/scenarios';
import type { Team } from '@/modules/teams';
import { create } from 'zustand';
import { useHealthStore } from '@/modules/combat';
import { getScenarioById, spawnYawFor } from '@/modules/scenarios';
import { TEAMS } from '@/modules/teams';
import { DEFAULT_SCENARIO_ID } from '../constants/play-defaults';
import {
  DEFAULT_LOCAL_SPAWN_INDEX,
  DEFAULT_LOCAL_TEAM,
  LOCAL_PLAYER_ENTITY_ID,
} from '../constants/player';
import { checkRoundEnd } from '../utils/check-round-end';
import { resetPlayerTransform, setPlayerPose } from './player-state';
import { useWeaponAmmoStore } from './weapon-ammo-store';

const COUNTDOWN_START = 3;
const COUNTDOWN_TICK_MS = 1_000;

let countdownTimer: ReturnType<typeof setInterval> | null = null;

function clearCountdownTimer() {
  if (countdownTimer) {
    clearInterval(countdownTimer);
    countdownTimer = null;
  }
}

export interface RoundState {
  phase: RoundPhase;
  countdown: number;
  roundNumber: number;
  winner: Team | null;
  roster: RosterEntry[];

  startRound: (scenarioId?: ScenarioId) => void;
  endRound: (winner: Team) => void;
  updateRoster: (entries: RosterEntry[]) => void;
  /** Call after each applyDamage to check if a team was wiped. */
  checkAndEndRound: () => void;
}

export const useRoundStore = create<RoundState>()((set, get) => ({
  phase: 'live',
  countdown: 0,
  roundNumber: 0,
  winner: null,
  roster: [],

  startRound: (scenarioId = DEFAULT_SCENARIO_ID) => {
    const scenario = getScenarioById(scenarioId);

    useHealthStore.getState().resetAll();
    useWeaponAmmoStore.getState().reset();
    setPlayerPose(null);
    clearCountdownTimer();

    const roster: RosterEntry[] = [];

    for (const team of TEAMS) {
      const spawns = scenario.teamSpawns[team] ?? [];
      for (let i = 0; i < spawns.length; i++) {
        const isLocalSlot = team === DEFAULT_LOCAL_TEAM && i === DEFAULT_LOCAL_SPAWN_INDEX;
        roster.push({
          entityId: isLocalSlot ? LOCAL_PLAYER_ENTITY_ID : `${team}-${i}`,
          team,
        });
      }
    }

    const localSpawns = scenario.teamSpawns[DEFAULT_LOCAL_TEAM];
    if (localSpawns && localSpawns.length > 0) {
      const index = Math.min(DEFAULT_LOCAL_SPAWN_INDEX, localSpawns.length - 1);
      const position = localSpawns[index]!;
      const yaw = spawnYawFor(scenario, DEFAULT_LOCAL_TEAM, position);
      resetPlayerTransform(position[0], position[2], yaw);
    }

    set((prev) => ({
      phase: 'countdown',
      countdown: COUNTDOWN_START,
      roundNumber: prev.roundNumber + 1,
      winner: null,
      roster,
    }));

    countdownTimer = setInterval(() => {
      const { phase, countdown } = get();
      if (phase !== 'countdown') {
        clearCountdownTimer();
        return;
      }
      if (countdown <= 1) {
        clearCountdownTimer();
        set({ phase: 'live', countdown: 0 });
        return;
      }
      set({ countdown: countdown - 1 });
    }, COUNTDOWN_TICK_MS);
  },

  endRound: (winner) => {
    clearCountdownTimer();
    set({ phase: 'round-end', winner, countdown: 0 });
  },

  updateRoster: (entries) => {
    set({ roster: entries });
  },

  checkAndEndRound: () => {
    const { phase, roster } = get();
    if (phase !== 'live') {
      return;
    }
    const result = checkRoundEnd({ roster, healthSystem: useHealthStore.getState() });
    if (result.ended && result.winner) {
      get().endRound(result.winner);
    }
  },
}));
