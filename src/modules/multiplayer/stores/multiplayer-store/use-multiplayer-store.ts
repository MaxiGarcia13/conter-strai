import type { MultiplayerStoreState, RemotePlayerEntry } from './types';
import type { EntityId } from '@/modules/soldiers';
import type { Team } from '@/modules/teams';
import { create } from 'zustand';
import { mapMatchRoundPhase } from './map-match-round-phase';
import { toRemotePlayerEntry } from './to-remote-player-entry';

export const useMultiplayerStore = create<MultiplayerStoreState>()((set, get) => ({
  remotePlayers: {},
  phase: null,
  winner: null,
  countdown: null,
  connected: false,

  applyPlayersUpdate: (payload) => {
    const prev = get().remotePlayers;
    const remotePlayers: Record<EntityId, RemotePlayerEntry> = {};
    for (const snapshot of payload.players) {
      if (snapshot.sessionId === payload.localSessionId) {
        continue;
      }
      const entry = toRemotePlayerEntry(snapshot);
      // Transform patches rebuild entries each update; keep an ephemeral pose
      // so a relayed jump/kneel is not wiped by the next position sync.
      const pose = prev[snapshot.sessionId]?.pose;
      if (pose) {
        entry.pose = pose;
      }
      remotePlayers[snapshot.sessionId] = entry;
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

  applyRemotePose: (sessionId, pose) => {
    const entry = get().remotePlayers[sessionId];
    if (!entry) {
      return;
    }
    const next = pose === 'clear'
      ? { ...entry, pose: undefined }
      : { ...entry, pose };
    set({ remotePlayers: { ...get().remotePlayers, [sessionId]: next } });
  },

  reset: () => {
    set({ remotePlayers: {}, phase: null, winner: null, countdown: null, connected: false });
  },
}));
