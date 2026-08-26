import type { PlayLoaderState } from './play-loader';
import type { ScenarioId } from '@/modules/scenarios';
import type { SoldierSkinId } from '@/modules/soldiers';
import type { Team } from '@/modules/teams';
import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { resolveRoomSession } from '@/modules/lobby/utils/room-session';
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
