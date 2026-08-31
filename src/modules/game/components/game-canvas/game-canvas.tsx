import type { ScenarioId } from '@/modules/scenarios';
import type { SoldierSkinId } from '@/modules/soldiers';
import type { Team } from '@/modules/teams';
import { Canvas } from '@react-three/fiber';
import { useEffect, useMemo } from 'react';
import { HealthBar } from '@/modules/combat';
import { DEFAULT_PLAY_SKIN_ID, DEFAULT_SCENARIO_ID } from '@/modules/game/constants/play-defaults';
import { LazyDevGameChrome, LazyDevSceneTools } from '@/modules/game/dev';
import { MobileControls } from '@/modules/game/input/components/mobile-controls';
import { isTouchPrimaryDevice } from '@/modules/game/input/utils/is-touch-primary-device';
import { useRoundStore } from '@/modules/game/stores/round-store';
import { resolveLocalSpawn } from '@/modules/game/utils/local-spawn';
import { LocalTransformSync } from '@/modules/multiplayer/components/local-transform-sync';
import { LazyRemotePlayers } from '@/modules/multiplayer/components/remote-players';
import { useMultiplayerStore } from '@/modules/multiplayer/stores/multiplayer-store';
import {
  getScenarioById,
  LazyScenarioScene,
} from '@/modules/scenarios';
import { ScenarioLighting } from '@/modules/scenarios/components/scenario-lighting';
import { ScenarioSky } from '@/modules/scenarios/components/scenario-sky';
import { DEFAULT_SUN_POSITION } from '@/modules/scenarios/constants/scenario-lighting';
import { AimMarker } from '../aim-marker';
import { CameraHud } from '../camera-hud';
import { CrosshairHud } from '../crosshair-hud';
import { DeferredAfterLoad } from '../deferred-after-load';
import { LazyGamePausePanel } from '../game-pause-panel';
import { LoadingReporter } from '../loading-reporter';
import { LazyLocalPlayer } from '../local-player';
import { PlayerControls } from '../player-controls';
import { LazyRoundEndBanner } from '../round-end-banner';
import { ShootingController } from '../shooting-controller';

import '@/modules/scenarios/utils/preload-scenario-textures';
import '@/modules/soldiers/soldier-skin-registry';

interface GameCanvasProps {
  roomId?: string;
  scenarioId?: ScenarioId;
  team?: Team;
  skinId?: SoldierSkinId;
}

export function GameCanvas({
  roomId,
  scenarioId = DEFAULT_SCENARIO_ID,
  team,
  skinId = DEFAULT_PLAY_SKIN_ID,
}: GameCanvasProps) {
  const scenario = useMemo(() => getScenarioById(scenarioId), [scenarioId]);
  const localSpawn = useMemo(() => resolveLocalSpawn(scenario, team), [scenario, team]);

  const matchConnected = useMultiplayerStore((state) => state.connected);

  const startRound = useRoundStore((state) => state.startRound);

  useEffect(() => {
    startRound(scenarioId);
  }, [scenarioId, startRound]);

  const touchPrimary = isTouchPrimaryDevice();

  return (
    <div
      className="fixed inset-0"
      id="game-canvas"
      style={touchPrimary ? { touchAction: 'none' } : undefined}
    >
      <Canvas
        shadows="percentage"
        className="h-full w-full"
        camera={{ fov: 75, near: 0.1, far: 300 }}
      >
        <LoadingReporter />

        <ScenarioLighting lighting={scenario.lighting} shadows />

        <ScenarioSky
          sky={scenario.sky}
          fog={scenario.fog}
          sunPosition={scenario.lighting?.sunPosition ?? DEFAULT_SUN_POSITION}
        />

        <LazyScenarioScene scenario={scenario} />

        <DeferredAfterLoad>
          <PlayerControls scenario={scenario} spawn={localSpawn} />

          {matchConnected && <LazyRemotePlayers />}

          <LazyLocalPlayer skinId={skinId} />

          <AimMarker />
          <ShootingController />
        </DeferredAfterLoad>

        <LocalTransformSync />

        {import.meta.env.DEV && <LazyDevSceneTools skinId={skinId} />}
      </Canvas>

      {touchPrimary ? <MobileControls /> : <CameraHud />}

      <DeferredAfterLoad>
        <CrosshairHud />
        <HealthBar />
      </DeferredAfterLoad>

      {import.meta.env.DEV && <LazyDevGameChrome />}

      <LazyRoundEndBanner roomId={roomId} scenarioId={scenarioId} />
      <LazyGamePausePanel roomId={roomId} scenarioId={scenarioId} />

    </div>
  );
}
