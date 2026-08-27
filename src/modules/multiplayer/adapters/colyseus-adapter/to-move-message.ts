import type { MoveMessage, TransformSyncPayload } from './types';

export function toMoveMessage(transform: TransformSyncPayload): MoveMessage {
  return {
    x: transform.x,
    y: 0,
    z: transform.z,
    rotY: transform.yaw,
  };
}
