export type HitZone = 'head' | 'body' | 'limb';

export type HitboxPresetId = 'humanoid-standard';

export type HitboxPart = {
  zone: HitZone;
  /** Center offset from the soldier root, meters (ground at Y=0). */
  offset: [number, number, number];
} & (
  | { kind: 'sphere'; radius: number }
  | { kind: 'box'; size: [number, number, number] }
);

export interface HitboxPreset {
  id: HitboxPresetId;
  parts: HitboxPart[];
}
