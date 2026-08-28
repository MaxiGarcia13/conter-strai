import type {
  LeaveListener,
  MatchHandle,
  MatchPlayerSnapshot,
  MatchRoom,
  PlayersUpdatePayload,
  PlayerUpdateListener,
  PoseListener,
  PosePayload,
  RemotePoseMessage,
  RoomClosedListener,
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
  let players: MatchPlayerSnapshot[] = room.state ? readMatchPlayers(room.state) : [];
  let latestTransform: TransformSyncPayload | null = null;
  let flushTimer: ReturnType<typeof setTimeout> | null = null;
  let connected = true;
  let lastPhase: MatchRoundPhase | null = room.state
    ? (room.state.roundPhase as MatchRoundPhase)
    : null;
  let lastWinner = room.state?.winner ?? '';
  let lastCountdown = room.state?.countdown ?? 0;

  const playerListeners = new Set<PlayerUpdateListener>();
  const roundListeners = new Set<RoundUpdateListener>();
  const poseListeners = new Set<PoseListener>();
  const leaveListeners = new Set<LeaveListener>();
  const roomClosedListeners = new Set<RoomClosedListener>();

  function emitRoundUpdate(state: MatchState): void {
    const phase = state.roundPhase as MatchRoundPhase;
    const winner = state.winner ?? '';
    const countdown = state.countdown ?? 0;
    if (phase === lastPhase && winner === lastWinner && countdown === lastCountdown) {
      return;
    }
    lastPhase = phase;
    lastWinner = winner;
    lastCountdown = countdown;
    const payload: RoundUpdatePayload = { phase, winner, countdown };
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

  // Schema patches are the source of truth; the broadcast covers clients that
  // missed a thin patch edge-case when the round flips to ended.
  room.onMessage('roundEnd', (message: { winner?: string }) => {
    const winner = message?.winner ?? room.state?.winner ?? '';
    lastPhase = 'ended';
    lastWinner = winner;
    lastCountdown = 0;
    const payload: RoundUpdatePayload = { phase: 'ended', winner, countdown: 0 };
    for (const listener of roundListeners) {
      listener(payload);
    }
  });

  room.onMessage('roomClosed', () => {
    for (const listener of roomClosedListeners) {
      listener();
    }
  });

  room.onMessage('pose', (message: { sessionId?: string; pose?: RemotePoseMessage }) => {
    if (!message?.sessionId || !message?.pose) {
      return;
    }
    const payload: PosePayload = { sessionId: message.sessionId, pose: message.pose };
    for (const listener of poseListeners) {
      listener(payload);
    }
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

  function sendPose(pose: RemotePoseMessage): void {
    if (!connected) {
      return;
    }
    room.send('pose', { pose });
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
    get reconnectionToken() {
      return room.reconnectionToken;
    },
    syncTransform,
    sendShot,
    sendPose,
    startRound: () => {
      if (connected) {
        room.send('startRound');
      }
    },
    onPlayerUpdate: (listener) => {
      const unsubscribe = subscribe(playerListeners, listener);
      if (players.length > 0) {
        listener({ localSessionId: sessionId, players });
      }
      return unsubscribe;
    },
    onRoundUpdate: (listener) => {
      const unsubscribe = subscribe(roundListeners, listener);
      if (room.state) {
        listener({
          phase: room.state.roundPhase as MatchRoundPhase,
          winner: room.state.winner ?? '',
          countdown: room.state.countdown ?? 0,
        });
      }
      return unsubscribe;
    },
    onPose: (listener) => subscribe(poseListeners, listener),
    onLeave: (listener) => subscribe(leaveListeners, listener),
    onRoomClosed: (listener) => subscribe(roomClosedListeners, listener),
    leave: () => room.leave(true),
  };

  setActiveMatch(handle);
  return handle;
}
