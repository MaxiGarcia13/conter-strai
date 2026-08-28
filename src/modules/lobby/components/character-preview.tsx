import type { SoldierSkinId } from '@/modules/soldiers';
import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { ScenarioLighting } from '@/modules/scenarios/components/scenario-lighting';
import { SoldierModel } from '@/modules/soldiers';

interface CharacterPreviewProps {
  skinId: SoldierSkinId;
}

/** Upper-chest / face height (~head anchor 1.57 − small drop). */
const PREVIEW_TARGET_Y = 1.45;

export function CharacterPreview({ skinId }: CharacterPreviewProps) {
  return (
    <Canvas
      camera={{ position: [0, PREVIEW_TARGET_Y, 1.55], fov: 28 }}
      className="size-full"
      gl={{ antialias: true }}
    >
      <ScenarioLighting />
      <SoldierModel id={skinId} animated={false} />
      <OrbitControls
        target={[0, PREVIEW_TARGET_Y, 0]}
        autoRotate
        autoRotateSpeed={2}
        enableZoom={false}
        enablePan={false}
        minPolarAngle={Math.PI / 2.4}
        maxPolarAngle={Math.PI / 2.05}
      />
    </Canvas>
  );
}
