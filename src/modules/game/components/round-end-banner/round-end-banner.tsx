import type { ScenarioId } from '@/modules/scenarios';
import { useState } from 'react';
import { CsButton } from '@/components/cs-button';
import { useEffectiveRoundPhase } from '@/modules/game/hooks/use-effective-round-phase';
import { resolveRoomHostCapabilities } from '@/modules/game/utils/host-capabilities';
import { leaveMatchToHome, leaveMatchToHomeAsHost } from '@/modules/game/utils/leave-match-to-home';
import { restartRound } from '@/modules/game/utils/restart-round';
import { readRoomSession } from '@/modules/lobby/utils/room-session';
import { useMultiplayerStore } from '@/modules/multiplayer/stores/multiplayer-store';
import { TEAM_DISPLAY_NAME } from '@/modules/teams';

interface RoundEndBannerProps {
  roomId?: string;
  scenarioId?: ScenarioId;
}

/** Full-screen overlay shown when a round ends. Server-driven in a match. */
export function RoundEndBanner({ roomId, scenarioId }: RoundEndBannerProps) {
  const connected = useMultiplayerStore((state) => state.connected);
  const { phase, winner } = useEffectiveRoundPhase();
  const { canRestart } = resolveRoomHostCapabilities(roomId);

  const [closing, setClosing] = useState(false);

  if (phase !== 'round-end' || !winner) {
    return null;
  }

  function handleRestart() {
    if (!canRestart || closing) {
      return;
    }
    restartRound(connected, scenarioId);
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
          await leaveMatchToHomeAsHost(roomId, sessionNow.hostToken);
        } catch {
          setClosing(false);
        }
        return;
      }
    }

    leaveMatchToHome(roomId);
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
