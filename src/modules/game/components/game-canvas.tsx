import type { ScenarioId } from '@/modules/scenarios';
import { Canvas } from '@react-three/fiber';
import { Suspense, useMemo } from 'react';
import { getScenarioById, ScenarioScene } from '@/modules/scenarios';

const DEFAULT_SCENARIO_ID = 'arena-01' satisfies ScenarioId;
const DEFAULT_LIGHTING = { ambient: 0.6, sunIntensity: 1.2 };

interface GameCanvasProps {
  scenarioId?: ScenarioId;
}

export function GameCanvas({ scenarioId = DEFAULT_SCENARIO_ID }: GameCanvasProps) {
  const scenario = useMemo(() => getScenarioById(scenarioId), [scenarioId]);
  const lighting = scenario.lighting ?? DEFAULT_LIGHTING;
  return (
    <Canvas
      shadows
      camera={{ fov: 75, near: 0.1, far: 300, position: [30, 18, 30] }}
      onCreated={({ camera }) => camera.lookAt(0, 1, 0)}
    >
      <ambientLight intensity={lighting.ambient} />
      <directionalLight
        castShadow
        intensity={lighting.sunIntensity}
        position={[40, 60, 20]}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-70}
        shadow-camera-right={70}
        shadow-camera-top={70}
        shadow-camera-bottom={-70}
        shadow-camera-far={200}
      />
      <Suspense fallback={null}>
        <ScenarioScene scenario={scenario} />
      </Suspense>
    </Canvas>
  );
}
