import type { Group } from 'three';
import type { EntityId } from '@/modules/soldiers';
import { useFrame } from '@react-three/fiber';
import { useRef, useState } from 'react';
import { DEFAULT_PLAY_SKIN_ID, MODEL_FORWARD_YAW_OFFSET } from '@/modules/game/constants/player';
import { SoldierMeshBody } from '@/modules/soldiers/components/soldier-mesh-body';
import { useSoldierLocomotion } from '@/modules/soldiers/hooks/use-soldier-locomotion';
import { useSoldierMesh } from '@/modules/soldiers/hooks/use-soldier-mesh';
import { resolveNpcPose } from '@/modules/soldiers/utils/resolve-soldier-pose';
import { useMultiplayerStore } from '../stores/multiplayer-store';

interface RemotePlayerProps {
  /** Colyseus session id — also the hitbox entity id on the server. */
  sessionId: EntityId;
}

/**
 * A networked soldier driven by the multiplayer store. Skin/team are fixed at
 * join, so the mesh mounts once and per-frame useFrame reads move the rig —
 * the 20 Hz transform sync never re-renders React.
 */
export function RemotePlayer({ sessionId }: RemotePlayerProps) {
  const rigRef = useRef<Group>(null);

  const remotePlayers = useMultiplayerStore((state) => state.remotePlayers);

  const [skinId] = useState(
    () => remotePlayers[sessionId]?.skin ?? DEFAULT_PLAY_SKIN_ID,
  );
  const { modelRef, source, scale, skin, animations } = useSoldierMesh(skinId);

  useSoldierLocomotion(modelRef, animations, skin.meshData.animations, {
    entityId: sessionId,
    getPose: () => {
      const entry = remotePlayers[sessionId];
      return entry ? resolveNpcPose(sessionId, entry.health.isEliminated) : null;
    },
  });

  useFrame(() => {
    const rig = rigRef.current;
    const entry = remotePlayers[sessionId];
    if (!rig || !entry) {
      return;
    }
    rig.position.set(entry.transform.x, 0, entry.transform.z);
    rig.rotation.y = entry.transform.rotY + MODEL_FORWARD_YAW_OFFSET;
  });

  return (
    <group ref={rigRef} name={`remote-${sessionId}`} userData={{ entityId: sessionId }}>
      <SoldierMeshBody
        modelRef={modelRef}
        source={source}
        scale={scale}
        hitboxPresetId={skin.hitboxPresetId}
        entityId={sessionId}
      />
    </group>
  );
}
