import type { PlayLoaderState } from './play-loader';
import type { ScenarioId } from '@/modules/scenarios';
import type { SoldierSkinId } from '@/modules/soldiers';
import type { Team } from '@/modules/teams';
import { Canvas } from '@react-three/fiber';
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { HealthBar } from '@/modules/combat';
import { LocalTransformSync } from '@/modules/multiplayer/components/local-transform-sync';
import { RemotePlayers } from '@/modules/multiplayer/components/remote-players';
import { useMultiplayerStore } from '@/modules/multiplayer/stores/multiplayer-store';
import {
  getScenarioById,
  ScenarioGround,
  ScenarioHouses,
  ScenarioProps,
  ScenarioSoldiers,
} from '@/modules/scenarios';
import { ScenarioLighting } from '@/modules/scenarios/components/scenario-lighting';
import { ScenarioSky } from '@/modules/scenarios/components/scenario-sky';
import { DEFAULT_SUN_POSITION } from '@/modules/scenarios/constants/scenario-lighting';
import { DEFAULT_PLAY_SKIN_ID, DEFAULT_SCENARIO_ID } from '../constants/play-defaults';
import { LazyDevGameChrome, LazyDevSceneTools } from '../dev';
import { useRoundStore } from '../state/round-store';
import { resolveLocalSpawn } from '../utils/local-spawn';
import { AimMarker } from './aim-marker';
import { CameraHud } from './camera-hud';
import { CrosshairHud } from './crosshair-hud';
import { DeferredAfterLoad } from './deferred-after-load';
import { GamePausePanel } from './game-pause-panel';
import { LoadingReporter } from './loading-reporter';
import { LocalPlayer } from './local-player';
import { PlayerControls } from './player-controls';
import { RoundEndBanner } from './round-end-banner';
import { ShootingController } from './shooting-controller';

interface GameCanvasProps {
  roomId?: string;
  scenarioId?: ScenarioId;
  team?: Team;
  skinId?: SoldierSkinId;
  onLoaderChange?: (state: PlayLoaderState | null) => void;
}

export function GameCanvas({
  roomId,
  scenarioId = DEFAULT_SCENARIO_ID,
  team,
  skinId = DEFAULT_PLAY_SKIN_ID,
  onLoaderChange,
}: GameCanvasProps) {
  const scenario = useMemo(() => getScenarioById(scenarioId), [scenarioId]);
  const localSpawn = useMemo(() => resolveLocalSpawn(scenario, team), [scenario, team]);
  const [trackLoading, setTrackLoading] = useState(Boolean(onLoaderChange));
  const matchConnected = useMultiplayerStore((state) => state.connected);

  const startRound = useRoundStore((state) => state.startRound);

  useEffect(() => {
    startRound(scenarioId);
  }, [scenarioId, startRound]);

  const handleLoaderChange = useCallback(
    (state: PlayLoaderState | null) => {
      onLoaderChange?.(state);
      if (state === null) {
        setTrackLoading(false);
      }
    },
    [onLoaderChange],
  );

  return (
    <div className="fixed inset-0" id="game-canvas">
      <Canvas
        shadows="percentage"
        className="h-full w-full"
        camera={{ fov: 75, near: 0.1, far: 300 }}
      >
        {trackLoading && onLoaderChange && <LoadingReporter onLoaderChange={handleLoaderChange} />}
        <ScenarioLighting lighting={scenario.lighting} shadows />
        <ScenarioSky
          sky={scenario.sky}
          fog={scenario.fog}
          sunPosition={scenario.lighting?.sunPosition ?? DEFAULT_SUN_POSITION}
        />

        <Suspense fallback={null}>
          <ScenarioGround scenario={scenario} />
        </Suspense>
        <Suspense fallback={null}>
          <ScenarioHouses scenario={scenario} />
        </Suspense>
        <Suspense fallback={null}>
          <ScenarioProps scenario={scenario} />
        </Suspense>

        <Suspense fallback={null}>
          <DeferredAfterLoad>
            <PlayerControls scenario={scenario} spawn={localSpawn} />
            {!matchConnected && (
              <ScenarioSoldiers
                scenario={scenario}
                skipKey={localSpawn.key}
              />
            )}
            {matchConnected && <RemotePlayers />}
            <LocalPlayer skinId={skinId} />

            <AimMarker />
            <ShootingController />
          </DeferredAfterLoad>
        </Suspense>

        <LocalTransformSync />

        <LazyDevSceneTools skinId={skinId} />
      </Canvas>

      <DeferredAfterLoad>
        <CameraHud />
        <CrosshairHud />
        <HealthBar />
      </DeferredAfterLoad>

      <LazyDevGameChrome />

      <RoundEndBanner roomId={roomId} scenarioId={scenarioId} />
      <GamePausePanel roomId={roomId} scenarioId={scenarioId} />
    </div>
  );
}
