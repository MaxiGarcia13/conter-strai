import type { ScenarioFog, ScenarioSky as ScenarioSkyConfig } from '../types';
import { Sky } from '@react-three/drei';

interface ScenarioSkyProps {
  sky?: ScenarioSkyConfig;
  fog?: ScenarioFog;
  /** Directional-light sun position used when the sky has no sun of its own. */
  sunPosition: [number, number, number];
}

export function ScenarioSky({ sky, fog, sunPosition }: ScenarioSkyProps) {
  const resolvedSun = sky?.sunPosition ?? sunPosition;

  return (
    <>
      {sky?.type === 'gradient' && <Sky sunPosition={resolvedSun} />}
      {sky?.type === 'color' && sky.horizonColor && (
        <color attach="background" args={[sky.horizonColor]} />
      )}
      {fog && <fog attach="fog" args={[fog.color, fog.near, fog.far]} />}
    </>
  );
}
