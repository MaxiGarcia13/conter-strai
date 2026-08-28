import type { ScenarioLighting as ScenarioLightingConfig } from '../types';
import { useThree } from '@react-three/fiber';
import { useEffect } from 'react';
import * as THREE from 'three';
import { DEFAULT_LIGHTING, DEFAULT_SUN_POSITION } from '../constants/scenario-lighting';

interface ScenarioLightingProps {
  lighting?: ScenarioLightingConfig;
  /** Enables castShadow + a large shadow frustum for the full arena. */
  shadows?: boolean;
}

export function ScenarioLighting({ lighting, shadows }: ScenarioLightingProps) {
  const gl = useThree((state) => state.gl);
  const config = lighting ?? DEFAULT_LIGHTING;
  const sunPosition = config.sunPosition ?? DEFAULT_SUN_POSITION;
  const { hemisphere } = config;

  useEffect(() => {
    if (!config.toneMapping) {
      return;
    }

    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = config.toneMappingExposure ?? 1.0;
  }, [gl, config.toneMapping, config.toneMappingExposure]);

  return (
    <>
      <ambientLight intensity={config.ambient} />
      {hemisphere && (
        <hemisphereLight
          args={[hemisphere.skyColor, hemisphere.groundColor, hemisphere.intensity]}
        />
      )}
      <directionalLight
        castShadow={shadows}
        intensity={config.sunIntensity}
        position={sunPosition}
        shadow-mapSize={shadows ? [1024, 1024] : [512, 512]}
        shadow-camera-left={shadows ? -70 : 0}
        shadow-camera-right={shadows ? 70 : 0}
        shadow-camera-top={shadows ? 70 : 0}
        shadow-camera-bottom={shadows ? -70 : 0}
        shadow-camera-far={shadows ? 200 : 50}
      />
    </>
  );
}
