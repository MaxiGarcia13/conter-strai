import type { MultiplayerStoreState, RemotePlayerEntry } from './types';
import type { EntityId } from '@/modules/soldiers';
import type { Team } from '@/modules/teams';
import { create } from 'zustand';
import { isStickyRemoteOneShot } from '@/modules/multiplayer/utils/syncable-remote-pose';
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
      // Transform patches rebuild entries each update; keep an ephemeral clip
      // so a relayed jump/kneel is not wiped by the next position sync.
      const prevEntry = prev[snapshot.sessionId];
      if (prevEntry?.pose) {
        entry.pose = prevEntry.pose;
      }
      if (prevEntry?.poseEpoch) {
        entry.poseEpoch = prevEntry.poseEpoch;
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
      : {
          ...entry,
          pose,
          poseEpoch: isStickyRemoteOneShot(pose)
            ? (entry.poseEpoch ?? 0) + 1
            : entry.poseEpoch,
        };
    set({ remotePlayers: { ...get().remotePlayers, [sessionId]: next } });
  },

  reset: () => {
    set({ remotePlayers: {}, phase: null, winner: null, countdown: null, connected: false });
  },
}));
