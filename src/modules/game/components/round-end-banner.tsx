import type { ScenarioId } from '@/modules/scenarios';
import { useEffect, useState } from 'react';
import { CsButton } from '@/components/cs-button';
import { clearRoomSession, readRoomSession } from '@/modules/lobby/utils/room-session';
import { leaveMatch, startMatch } from '@/modules/multiplayer/adapters/colyseus-adapter';
import { deleteRoom } from '@/modules/multiplayer/services/delete-room';
import { LobbyRestError } from '@/modules/multiplayer/services/lobby-rest';
import { useMultiplayerStore } from '@/modules/multiplayer/stores/multiplayer-store';
import { TEAM_DISPLAY_NAME } from '@/modules/teams';
import { DEFAULT_SCENARIO_ID } from '../constants/play-defaults';
import { useRoundStore } from '../state/round-store';

interface RoundEndBannerProps {
  roomId?: string;
  scenarioId?: ScenarioId;
}

/** Full-screen overlay shown when a round ends. Server-driven in a match. */
export function RoundEndBanner({
  roomId,
  scenarioId = DEFAULT_SCENARIO_ID,
}: RoundEndBannerProps) {
  const connected = useMultiplayerStore((state) => state.connected);
  const mpPhase = useMultiplayerStore((state) => state.phase);
  const mpWinner = useMultiplayerStore((state) => state.winner);
  const roundPhase = useRoundStore((state) => state.phase);
  const roundWinner = useRoundStore((state) => state.winner);
  const startRound = useRoundStore((state) => state.startRound);
  const session = roomId ? readRoomSession(roomId) : null;
  const isHost = session?.role === 'host' || !roomId;
  const [closing, setClosing] = useState(false);

  const phase = roomId ? mpPhase : roundPhase;
  const winner = roomId ? mpWinner : roundWinner;
  /** Multiplayer: host only. Offline: always. */
  const canRestart = roomId ? isHost : true;

  useEffect(() => {
    if (phase === 'round-end' && document.pointerLockElement) {
      document.exitPointerLock();
    }
  }, [phase]);

  if (phase !== 'round-end' || !winner) {
    return null;
  }

  function handleRestart() {
    if (!canRestart || closing) {
      return;
    }
    if (connected) {
      startMatch();
      return;
    }
    startRound(scenarioId);
  }

  async function handleHome() {
    if (closing) {
      return;
    }
    setClosing(true);

    if (roomId) {
      const sessionNow = readRoomSession(roomId);
      if (sessionNow?.role === 'host' && sessionNow.hostToken) {
        try {
          await deleteRoom(roomId, sessionNow.hostToken);
        } catch (cause) {
          if (!(cause instanceof LobbyRestError) || cause.status !== 404) {
            setClosing(false);
            return;
          }
        }
        // Peers navigate via `roomClosed`; still exit locally if the message is missed.
        clearRoomSession(roomId);
        window.location.href = '/';
        return;
      }

      if (connected) {
        // Hard-nav tears the page down — do not await Colyseus reconnect grace.
        void leaveMatch();
      }
      clearRoomSession(roomId);
      window.location.href = '/';
      return;
    }

    if (connected) {
      void leaveMatch();
    }
    window.location.href = '/';
  }

  return (
    <div
      role="alert"
      aria-label={`${TEAM_DISPLAY_NAME[winner]} win the round`}
      className="fixed inset-0 z-20 flex items-center justify-center bg-background-deep/50"
    >
      <div className="border border-surface-border bg-background-deep/90 px-8 py-6 text-center font-mono tracking-widest uppercase">
        <p className="mb-1 text-sm text-foreground/60">Round Over</p>
        <p className="text-2xl font-bold text-accent">
          {TEAM_DISPLAY_NAME[winner]}
          {' '}
          Win
        </p>
        {connected && !canRestart && (
          <p className="mt-3 text-xs tracking-widest text-foreground/50 normal-case">
            Waiting for host to restart
          </p>
        )}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3 normal-case tracking-normal">
          {canRestart && (
            <CsButton type="button" variant="primary" onClick={handleRestart} disabled={closing}>
              Restart
            </CsButton>
          )}
          <CsButton
            type="button"
            variant="secondary"
            onClick={handleHome}
            disabled={closing}
            aria-busy={closing}
          >
            {closing ? 'Closing…' : 'Home'}
          </CsButton>
        </div>
      </div>
    </div>
  );
}
