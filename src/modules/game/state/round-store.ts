import type { RosterEntry } from '../services/check-round-end';
import type { RoundPhase } from '../types';
import type { ScenarioId } from '@/modules/scenarios';
import type { Team } from '@/modules/teams';
import { create } from 'zustand';
import { useHealthStore } from '@/modules/combat';
import { getScenarioById, spawnYawFor } from '@/modules/scenarios';
import {
  DEFAULT_LOCAL_SPAWN_INDEX,
  DEFAULT_LOCAL_TEAM,
  LOCAL_PLAYER_ENTITY_ID,
} from '../constants/player';
import { DEFAULT_SCENARIO_ID } from '../constants/play-defaults';
import { checkRoundEnd } from '../services/check-round-end';
import { resetPlayerTransform, setPlayerPose } from './player-state';

export interface RoundState {
  phase: RoundPhase;
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
  roundNumber: 0,
  winner: null,
  roster: [],

  startRound: (scenarioId = DEFAULT_SCENARIO_ID) => {
    const scenario = getScenarioById(scenarioId);

    useHealthStore.getState().resetAll();
    setPlayerPose(null);

    const roster: RosterEntry[] = [];
    const teams: Team[] = ['soldier', 'civilian'];

    for (const team of teams) {
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
      phase: 'live',
      roundNumber: prev.roundNumber + 1,
      winner: null,
      roster,
    }));
  },

  endRound: (winner) => {
    set({ phase: 'round-end', winner });
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
