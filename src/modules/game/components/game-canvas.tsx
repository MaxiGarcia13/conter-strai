import type { PlayLoaderState } from './play-loader';
import type { ScenarioId } from '@/modules/scenarios';
import { Canvas } from '@react-three/fiber';

import { Suspense, useMemo } from 'react';
import {
  getScenarioById,
  ScenarioScene,
  ScenarioSoldiers,
  spawnKey,
} from '@/modules/scenarios';
import { DEFAULT_LOCAL_SPAWN_INDEX, DEFAULT_LOCAL_TEAM } from '../constants/player';
import { DeferredAfterLoad } from './deferred-after-load';
import { FpsControls } from './fps-controls';
import { FpsViewModel } from './fps-view-model';
import { LoadingReporter } from './loading-reporter';

const DEFAULT_SCENARIO_ID = 'arena-01' satisfies ScenarioId;
const DEFAULT_LIGHTING = { ambient: 0.6, sunIntensity: 1.2 };

interface GameCanvasProps {
  scenarioId?: ScenarioId;
  onLoaderChange?: (state: PlayLoaderState | null) => void;
}

export function GameCanvas({ scenarioId = DEFAULT_SCENARIO_ID, onLoaderChange }: GameCanvasProps) {
  const scenario = useMemo(() => getScenarioById(scenarioId), [scenarioId]);
  const lighting = scenario.lighting ?? DEFAULT_LIGHTING;
  const localSpawnKey = spawnKey(DEFAULT_LOCAL_TEAM, DEFAULT_LOCAL_SPAWN_INDEX);

  return (
    <div className="fixed inset-0">
      <Canvas shadows className="h-full w-full" camera={{ fov: 75, near: 0.1, far: 300 }}>
        {onLoaderChange && <LoadingReporter onLoaderChange={onLoaderChange} />}
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
        <FpsControls scenario={scenario} />
        <Suspense fallback={null}>
          <ScenarioScene scenario={scenario} />
        </Suspense>
        <Suspense fallback={null}>
          <DeferredAfterLoad>
            <ScenarioSoldiers scenario={scenario} skipKey={localSpawnKey} />
            <FpsViewModel />
          </DeferredAfterLoad>
        </Suspense>
      </Canvas>
    </div>
  );
}
