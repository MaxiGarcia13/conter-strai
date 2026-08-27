import type {
  LeaveListener,
  MatchHandle,
  MatchPlayerSnapshot,
  MatchRoom,
  PlayersUpdatePayload,
  PlayerUpdateListener,
  RoundUpdateListener,
  RoundUpdatePayload,
  ShotPayload,
  TransformSyncPayload,
} from './types';
import type { MatchRoundPhase, MatchState } from '@/modules/multiplayer/schema';
import { setActiveMatch } from './active-match';
import { readMatchPlayers } from './read-match-players';
import { toMoveMessage } from './to-move-message';
import { TRANSFORM_SYNC_INTERVAL_MS } from './types';

function subscribe<T>(listeners: Set<T>, listener: T): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function buildMatchHandle(room: MatchRoom): MatchHandle {
  const sessionId = room.sessionId;
  let players: MatchPlayerSnapshot[] = [];
  let latestTransform: TransformSyncPayload | null = null;
  let flushTimer: ReturnType<typeof setTimeout> | null = null;
  let connected = true;
  let lastPhase: MatchRoundPhase | null = null;
  let lastWinner = '';

  const playerListeners = new Set<PlayerUpdateListener>();
  const roundListeners = new Set<RoundUpdateListener>();
  const leaveListeners = new Set<LeaveListener>();

  function emitRoundUpdate(state: MatchState): void {
    const phase = state.roundPhase as MatchRoundPhase;
    const winner = state.winner ?? '';
    if (phase === lastPhase && winner === lastWinner) {
      return;
    }
    lastPhase = phase;
    lastWinner = winner;
    const payload: RoundUpdatePayload = { phase, winner };
    for (const listener of roundListeners) {
      listener(payload);
    }
  }

  room.onStateChange((nextState) => {
    players = readMatchPlayers(nextState);
    const payload: PlayersUpdatePayload = { localSessionId: sessionId, players };
    for (const listener of playerListeners) {
      listener(payload);
    }
    emitRoundUpdate(nextState);
  });

  function flushTransform(): void {
    flushTimer = null;
    if (!connected || !latestTransform) {
      return;
    }
    const transform = latestTransform;
    latestTransform = null;
    room.send('move', toMoveMessage(transform));
  }

  function syncTransform(transform: TransformSyncPayload): void {
    latestTransform = transform;
    if (flushTimer === null) {
      flushTimer = setTimeout(flushTransform, TRANSFORM_SYNC_INTERVAL_MS);
    }
  }

  function sendShot(shot: ShotPayload): void {
    if (!connected) {
      return;
    }
    room.send('shot', shot);
  }

  room.onLeave((code) => {
    connected = false;
    if (flushTimer !== null) {
      clearTimeout(flushTimer);
      flushTimer = null;
    }
    setActiveMatch(null);
    for (const listener of leaveListeners) {
      listener(code);
    }
    room.removeAllListeners();
  });

  const handle: MatchHandle = {
    room,
    roomId: room.roomId ?? sessionId,
    sessionId,
    localPlayerId: sessionId,
    get players() {
      return players;
    },
    syncTransform,
    sendShot,
    onPlayerUpdate: (listener) => subscribe(playerListeners, listener),
    onRoundUpdate: (listener) => subscribe(roundListeners, listener),
    onLeave: (listener) => subscribe(leaveListeners, listener),
    leave: () => room.leave(true),
  };

  setActiveMatch(handle);
  return handle;
}
