import type { PlayLoaderState } from './play-loader';
import type { ScenarioId } from '@/modules/scenarios';
import type { SoldierSkinId } from '@/modules/soldiers';
import type { Team } from '@/modules/teams';
import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { resolveRoomSession } from '@/modules/lobby/utils/room-session';
import { MatchJoinError } from '@/modules/multiplayer/components/match-join-error';
import { useMatchJoin } from '@/modules/multiplayer/hooks/use-match-join';
import { PlayLoader } from './play-loader';

const GameCanvas = lazy(async () => {
  const module = await import('./game-canvas');
  return { default: module.GameCanvas };
});

const BOOT_LOADER: PlayLoaderState = {
  label: 'Loading engine',
  progress: null,
};

interface GameCanvasIslandProps {
  roomId?: string;
  scenarioId?: ScenarioId;
  team?: Team;
  skinId?: SoldierSkinId;
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

  if (joinError) {
    return <MatchJoinError roomId={roomId} message={joinError} />;
  }

  if (joining) {
    return <PlayLoader label="Connecting to match" progress={null} />;
  }

  return (
    <>
      {visible && <PlayLoader {...loader} />}
      <Suspense fallback={null}>
        <GameCanvas
          scenarioId={scenarioId}
          team={team}
          skinId={skinId}
          onLoaderChange={onLoaderChange}
        />
      </Suspense>
    </>
  );
}

export function GameCanvasIsland({ roomId, scenarioId, team, skinId }: GameCanvasIslandProps) {
  const roomSession = roomId ? resolveRoomSession(roomId) : null;
  const resolvedScenarioId = roomSession?.scenario ?? scenarioId;
  const resolvedTeam = roomSession?.team ?? team;
  const resolvedSkinId = roomSession?.skin ?? skinId;
  const [visible, setVisible] = useState(true);
  const [loader, setLoader] = useState<PlayLoaderState>(BOOT_LOADER);

  useEffect(() => {
    document.getElementById('play-boot')?.remove();
  }, []);

  const handleLoaderChange = useCallback((state: PlayLoaderState | null) => {
    if (state === null) {
      setVisible(false);
      return;
    }
    setLoader(state);
    setVisible(true);
  }, []);

  if (roomId) {
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

  return (
    <>
      {visible && <PlayLoader {...loader} />}
      <Suspense fallback={null}>
        <GameCanvas
          scenarioId={resolvedScenarioId}
          team={resolvedTeam}
          skinId={resolvedSkinId}
          onLoaderChange={handleLoaderChange}
        />
      </Suspense>
    </>
  );
}
