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
  ScenarioScene,
  ScenarioSoldiers,
} from '@/modules/scenarios';
import { DEFAULT_PLAY_SKIN_ID, DEFAULT_SCENARIO_ID } from '../constants/play-defaults';
import { LazyDevGameChrome, LazyDevSceneTools } from '../dev';
import { useRoundStore } from '../state/round-store';
import { resolveLocalSpawn } from '../utils/local-spawn';
import { AimMarker } from './aim-marker';
import { CameraHud } from './camera-hud';
import { CrosshairHud } from './crosshair-hud';
import { DeferredAfterLoad } from './deferred-after-load';
import { LoadingReporter } from './loading-reporter';
import { LocalPlayer } from './local-player';
import { PlayerControls } from './player-controls';
import { RoundEndBanner } from './round-end-banner';
import { ShootingController } from './shooting-controller';

const DEFAULT_LIGHTING = { ambient: 0.6, sunIntensity: 1.2 };

interface GameCanvasProps {
  scenarioId?: ScenarioId;
  team?: Team;
  skinId?: SoldierSkinId;
  onLoaderChange?: (state: PlayLoaderState | null) => void;
}

export function GameCanvas({
  scenarioId = DEFAULT_SCENARIO_ID,
  team,
  skinId = DEFAULT_PLAY_SKIN_ID,
  onLoaderChange,
}: GameCanvasProps) {
  const scenario = useMemo(() => getScenarioById(scenarioId), [scenarioId]);
  const lighting = scenario.lighting ?? DEFAULT_LIGHTING;
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
    <div className="fixed inset-0">
      <Canvas shadows="percentage" className="h-full w-full" camera={{ fov: 75, near: 0.1, far: 300 }}>
        {trackLoading && onLoaderChange && <LoadingReporter onLoaderChange={handleLoaderChange} />}
        <ambientLight intensity={lighting.ambient} />
        <directionalLight
          castShadow
          intensity={lighting.sunIntensity}
          position={[40, 60, 20]}
          shadow-mapSize={[1024, 1024]}
          shadow-camera-left={-70}
          shadow-camera-right={70}
          shadow-camera-top={70}
          shadow-camera-bottom={-70}
          shadow-camera-far={200}
        />

        <PlayerControls scenario={scenario} spawn={localSpawn} />

        <Suspense fallback={null}>
          <ScenarioScene scenario={scenario} />
        </Suspense>

        <Suspense fallback={null}>
          <DeferredAfterLoad>
            {!matchConnected && (
              <ScenarioSoldiers
                scenario={scenario}
                skipKey={localSpawn.key}
              />
            )}
            {matchConnected && <RemotePlayers />}
            <LocalPlayer skinId={skinId} />
          </DeferredAfterLoad>
        </Suspense>

        <AimMarker />
        <ShootingController />
        <LocalTransformSync />

        <LazyDevSceneTools skinId={skinId} />
      </Canvas>
      <CameraHud />
      <CrosshairHud />
      <LazyDevGameChrome />
      <HealthBar />
      <RoundEndBanner />
    </div>
  );
}
