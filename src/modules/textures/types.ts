export interface TextureMapSet {
  color?: string;
  normal?: string;
  roughness?: string;
  ao?: string;
}

export interface TextureDefinition {
  id: string;
  maps: TextureMapSet;
  roughness?: number;
  metalness?: number;
}

export type TextureId
  = 'forrest_ground'
    | 'asphalt'
    | 'brown_floor_tiles'
    | 'castle_brick_broken'
    | 'broken_brick'
    | 'cliff_side';
