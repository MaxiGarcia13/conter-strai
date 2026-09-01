import type { SoldierSkinId } from '@/modules/soldiers';
import { SoldierMeshBody } from '@/modules/soldiers/components/soldier-mesh-body';
import { useSoldierMesh } from '@/modules/soldiers/hooks/use-soldier-mesh';
import { useLobbyIdleFight } from '../hooks/use-lobby-idle-fight';

interface CharacterPreviewModelProps {
  skinId: SoldierSkinId;
}

export function CharacterPreviewModel({ skinId }: CharacterPreviewModelProps) {
  const { modelRef, source, scale, skin } = useSoldierMesh(skinId);
  useLobbyIdleFight(modelRef, source, skinId);

  return (
    <SoldierMeshBody
      modelRef={modelRef}
      source={source}
      scale={scale}
      hitboxPresetId={skin.hitboxPresetId}
    />
  );
}
