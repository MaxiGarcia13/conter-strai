import type { PlayLoaderState } from './play-loader';
import type { ScenarioId } from '@/modules/scenarios';
import { Canvas } from '@react-three/fiber';

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { HealthBar } from '@/modules/combat';
import {
  getScenarioById,
  ScenarioScene,
  ScenarioSoldiers,
} from '@/modules/scenarios';
import { useRoundStore } from '../state/round-store';
import { resolveLocalSpawn } from '../utils/local-spawn';
import { resolvePlaySkinId } from '../utils/resolve-play-skin-id';
import { AimMarker } from './aim-marker';
import { CameraHud } from './camera-hud';
import { CrosshairHud } from './crosshair-hud';
import { DeferredAfterLoad } from './deferred-after-load';
import { LoadingReporter } from './loading-reporter';
import { LocalPlayer } from './local-player';
import { PlayTestHook } from './play-test-hook';
import { PlayerControls } from './player-controls';
import { RoundEndBanner } from './round-end-banner';
import { ShootingController } from './shooting-controller';

const DEFAULT_SCENARIO_ID = 'arena-01' satisfies ScenarioId;
const DEFAULT_LIGHTING = { ambient: 0.6, sunIntensity: 1.2 };

interface GameCanvasProps {
  scenarioId?: ScenarioId;
  onLoaderChange?: (state: PlayLoaderState | null) => void;
}

export function GameCanvas({ scenarioId = DEFAULT_SCENARIO_ID, onLoaderChange }: GameCanvasProps) {
  const scenario = useMemo(() => getScenarioById(scenarioId), [scenarioId]);
  const lighting = scenario.lighting ?? DEFAULT_LIGHTING;
  const localSpawn = useMemo(() => resolveLocalSpawn(scenario), [scenario]);
  const skinId = useMemo(() => resolvePlaySkinId(), []);
  const [trackLoading, setTrackLoading] = useState(Boolean(onLoaderChange));

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

        {!!import.meta.env.DEV && <PlayTestHook />}

        <Suspense fallback={null}>
          <ScenarioScene scenario={scenario} />
        </Suspense>

        <Suspense fallback={null}>
          <DeferredAfterLoad>
            <ScenarioSoldiers
              scenario={scenario}
              skipKey={localSpawn.key}
            />
            <LocalPlayer skinId={skinId} />
          </DeferredAfterLoad>
        </Suspense>

        <AimMarker />
        <ShootingController />
      </Canvas>
      <CameraHud />
      <CrosshairHud />
      <HealthBar />
      <RoundEndBanner />
    </div>
  );
}
