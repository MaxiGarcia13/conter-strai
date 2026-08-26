export interface DebugNode {
  scale: { x: number };
  quaternion: {
    x: number;
    y: number;
    z: number;
    w: number;
  };
  matrixWorld: { elements: number[] };
}

export function angleFromIdentity(q: { x: number; y: number; z: number; w: number }): number {
  const dot = q.w;
  return 2 * Math.acos(Math.min(1, Math.abs(dot)));
}

export function findLocalNode(localRoot: unknown, name: string): DebugNode | null {
  const root = localRoot as { getObjectByName: (n: string) => DebugNode | null } | null;
  return root?.getObjectByName(name) ?? root?.getObjectByName(name.replace(':', '')) ?? null;
}
