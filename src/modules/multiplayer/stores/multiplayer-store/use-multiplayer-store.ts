import type { MultiplayerStoreState, RemotePlayerEntry } from './types';
import type { EntityId } from '@/modules/soldiers';
import type { Team } from '@/modules/teams';
import { create } from 'zustand';
import { mapMatchRoundPhase } from './map-match-round-phase';
import { toRemotePlayerEntry } from './to-remote-player-entry';

export const useMultiplayerStore = create<MultiplayerStoreState>()((set) => ({
  remotePlayers: {},
  phase: null,
  winner: null,
  countdown: null,
  connected: false,

  applyPlayersUpdate: (payload) => {
    const remotePlayers: Record<EntityId, RemotePlayerEntry> = {};
    for (const snapshot of payload.players) {
      if (snapshot.sessionId === payload.localSessionId) {
        continue;
      }
      remotePlayers[snapshot.sessionId] = toRemotePlayerEntry(snapshot);
    }
    set({ remotePlayers, connected: true });
  },

  applyRoundUpdate: (payload) => {
    const phase = mapMatchRoundPhase(payload.phase);
    set({
      phase,
      winner: (payload.winner as Team | '') || null,
      countdown: phase === 'countdown' && payload.countdown > 0 ? payload.countdown : null,
      connected: true,
    });
  },

  reset: () => {
    set({ remotePlayers: {}, phase: null, winner: null, countdown: null, connected: false });
  },
}));
