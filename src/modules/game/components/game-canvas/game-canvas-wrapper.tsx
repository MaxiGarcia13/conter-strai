import type { ScenarioId } from '@/modules/scenarios/types';
import type { SoldierSkinId } from '@/modules/soldiers/types';
import type { Team } from '@/modules/teams/types';
import { lazy, Suspense, useEffect } from 'react';
import { resolveRoomSession } from '@/modules/lobby';
import { playerReady } from '@/modules/multiplayer/adapters/colyseus-adapter/match-session';
import { MatchJoinError } from '@/modules/multiplayer/components/match-join-error';
import { useMatchJoin } from '@/modules/multiplayer/hooks/use-match-join';
import { CountdownBanner } from '../countdown-banner';
import { PlayLoader } from '../play-loader';
import { GameCanvasLoader } from './game-canvas-loader';

interface GameCanvasWrapperProps {
  roomId: string;
  scenarioId?: ScenarioId;
  team?: Team;
  skinId?: SoldierSkinId;
}

const GameCanvas = lazy(async () => {
  const module = await import('./game-canvas');
  return { default: module.GameCanvas };
});

export function GameCanvasWrapper({ roomId, scenarioId, team, skinId }: GameCanvasWrapperProps) {
  const { joining, error: joinError } = useMatchJoin(roomId);

  const roomSession = roomId ? resolveRoomSession(roomId) : null;
  const resolvedScenarioId = roomSession?.scenario ?? scenarioId;
  const resolvedTeam = roomSession?.team ?? team;
  const resolvedSkinId = roomSession?.skin ?? skinId;

  const readyAfterDelay = (delay: number) => {
    setTimeout(() => {
      playerReady();
    }, delay);
  };

  useEffect(() => {
    document.getElementById('play-boot')?.remove();
  }, []);

  useEffect(() => {
    if (!joining && !joinError) {
      readyAfterDelay(2000);
    }
  }, [joining, joinError]);

  if (joinError) {
    return <MatchJoinError roomId={roomId} message={joinError} />;
  }

  if (joining) {
    return <PlayLoader label="Connecting to match" progress={null} />;
  }

  return (
    <>
      <GameCanvasLoader />

      <Suspense fallback={null}>
        <GameCanvas
          roomId={roomId}
          scenarioId={resolvedScenarioId}
          team={resolvedTeam}
          skinId={resolvedSkinId}
        />
      </Suspense>

      <CountdownBanner />
    </>
  );
}
