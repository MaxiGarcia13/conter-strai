import type { ScenarioId } from '@/modules/scenarios';
import { useEffect } from 'react';
import { CsButton } from '@/components/cs-button';
import { APP_VERSION } from '@/constants/app-version';
import { GAME_COMMANDS } from '@/modules/game/constants/game-bindings';
import { useGamePauseStore } from '@/modules/game/stores/game-pause-store';
import { useRoundStore } from '@/modules/game/stores/round-store';
import { leaveMatchToHome } from '@/modules/game/utils/leave-match-to-home';
import { restartRound } from '@/modules/game/utils/restart-round';
import { readRoomSession } from '@/modules/lobby/utils/room-session';
import { useMultiplayerStore } from '@/modules/multiplayer/stores/multiplayer-store';

interface GamePausePanelProps {
  roomId?: string;
  scenarioId?: ScenarioId;
}

/** Full-screen pause dialog — Resume / Restart (host) / Leave / Commands. */
export function GamePausePanel({ roomId, scenarioId }: GamePausePanelProps) {
  const isPaused = useGamePauseStore((s) => s.isPaused);
  const showCommands = useGamePauseStore((s) => s.showCommands);
  const togglePause = useGamePauseStore((s) => s.togglePause);
  const setPaused = useGamePauseStore((s) => s.setPaused);
  const setShowCommands = useGamePauseStore((s) => s.setShowCommands);

  const connected = useMultiplayerStore((s) => s.connected);
  const mpPhase = useMultiplayerStore((s) => s.phase);
  const roundPhase = useRoundStore((s) => s.phase);
  const phase = connected ? mpPhase : roundPhase;

  const session = roomId ? readRoomSession(roomId) : null;
  const isHost = session?.role === 'host' || !roomId;
  const canRestart = roomId ? isHost : true;

  // Pause is only meaningful while live — close it on round end / leave.
  useEffect(() => {
    if (phase !== 'live') {
      setPaused(false);
    }
  }, [phase, setPaused]);

  if (!isPaused || phase !== 'live') {
    return null;
  }

  function handleRestart() {
    setPaused(false);
    restartRound(connected, scenarioId);
  }

  function handleLeave() {
    leaveMatchToHome(roomId);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Game paused"
      className="fixed inset-0 z-20 flex items-center justify-center bg-background-deep/50"
    >
      <div className="border border-surface-border bg-background-deep/90 px-8 py-6 text-center font-mono tracking-widest uppercase">
        <p className="mb-4 text-2xl font-bold text-accent">{showCommands ? 'Commands' : 'Paused'}</p>

        {showCommands
          ? (
              <div className="flex flex-col items-stretch gap-3 normal-case tracking-normal">
                <dl className="border-t border-surface-border pt-4 text-left text-sm">
                  {GAME_COMMANDS.map((command) => {
                    if (command.devOnly && !import.meta.env.DEV)
                      return null;

                    return (
                      <div key={command.key} className="flex items-center justify-between gap-6 py-1">
                        <dt className="text-foreground/60">{command.action}</dt>
                        <dd className="font-bold text-foreground">{command.key}</dd>
                      </div>
                    );
                  })}
                </dl>

                <CsButton type="button" variant="secondary" onClick={() => setShowCommands(false)}>
                  Back
                </CsButton>
              </div>
            )
          : (
              <div className="flex flex-col items-stretch gap-3 normal-case tracking-normal">
                <CsButton type="button" variant="primary" onClick={togglePause}>
                  Resume
                </CsButton>

                {canRestart && (
                  <CsButton type="button" variant="secondary" onClick={handleRestart}>
                    Restart
                  </CsButton>
                )}

                <CsButton type="button" variant="secondary" onClick={() => setShowCommands(true)}>
                  Commands
                </CsButton>

                <CsButton type="button" variant="secondary" onClick={handleLeave}>
                  Leave
                </CsButton>
              </div>
            )}

        <p
          className="mt-6 text-xs tracking-widest text-foreground/40 normal-case"
          aria-label={`Version ${APP_VERSION}`}
        >
          v
          {APP_VERSION}
        </p>
      </div>
    </div>
  );
}
