import type { PlayLoaderState } from './play-loader';
import type { ScenarioId } from '@/modules/scenarios';
import type { SoldierSkinId } from '@/modules/soldiers';
import type { Team } from '@/modules/teams';
import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { resolveRoomSession } from '@/modules/lobby/utils/room-session';
import { playerReady } from '@/modules/multiplayer/adapters/colyseus-adapter/match-session';
import { MatchJoinError } from '@/modules/multiplayer/components/match-join-error';
import { useMatchJoin } from '@/modules/multiplayer/hooks/use-match-join';
import { CountdownBanner } from './countdown-banner';
import { LazyPlayLoader } from './play-loader';

const GameCanvas = lazy(async () => {
  const module = await import('./game-canvas');
  return { default: module.GameCanvas };
});

const BOOT_LOADER: PlayLoaderState = {
  label: 'Loading engine',
  progress: null,
};

interface GameCanvasIslandProps {
  roomId: string;
  scenarioId?: ScenarioId;
  team?: Team;
  skinId?: SoldierSkinId;
}

export function GameCanvasIsland({ roomId, scenarioId, team, skinId }: GameCanvasIslandProps) {
  const roomSession = roomId ? resolveRoomSession(roomId) : null;
  const resolvedScenarioId = roomSession?.scenario ?? scenarioId;
  const resolvedTeam = roomSession?.team ?? team;
  const resolvedSkinId = roomSession?.skin ?? skinId;
  const [visible, setVisible] = useState(true);
  const [loader, setLoader] = useState<PlayLoaderState>(BOOT_LOADER);

  const handleLoaderChange = useCallback((state: PlayLoaderState | null) => {
    if (!visible)
      return;

    if (state === null) {
      setVisible(false);
      // Guarantee the static boot shell cannot linger if the lazy React
      // PlayLoader never mounted (e.g. deploy finished before its chunk ready).
      document.getElementById('play-boot')?.remove();
    } else {
      setVisible(true);
      setLoader(state);
    }
  }, []);

  return (
    <MatchPlayCanvas
      roomId={roomId}
      scenarioId={resolvedScenarioId}
      team={resolvedTeam}
      skinId={resolvedSkinId}
      onLoaderChange={handleLoaderChange}
      visible={visible}
      loader={loader}
    />
  );
}

function MatchPlayCanvas({
  roomId,
  scenarioId,
  team,
  skinId,
  onLoaderChange,
  visible,
  loader,
}: {
  roomId: string;
  scenarioId?: ScenarioId;
  team?: Team;
  skinId?: SoldierSkinId;
  onLoaderChange: (state: PlayLoaderState | null) => void;
  visible: boolean;
  loader: PlayLoaderState;
}) {
  const { joining, error: joinError } = useMatchJoin(roomId);

  const readyAfterDelay = (delay: number) => {
    setTimeout(() => {
      playerReady();
    }, delay);
  };

  useEffect(() => {
    if (!joining && !joinError && visible) {
      readyAfterDelay(2000);
    }
  }, [visible, joining, joinError]);

  if (joinError) {
    return <MatchJoinError roomId={roomId} message={joinError} />;
  }

  if (joining) {
    return <LazyPlayLoader label="Connecting to match" progress={null} />;
  }

  return (
    <>
      {visible && <LazyPlayLoader {...loader} />}

      <Suspense fallback={null}>
        <GameCanvas
          roomId={roomId}
          scenarioId={scenarioId}
          team={team}
          skinId={skinId}
          onLoaderChange={onLoaderChange}
        />
      </Suspense>

      <CountdownBanner />
    </>
  );
}
