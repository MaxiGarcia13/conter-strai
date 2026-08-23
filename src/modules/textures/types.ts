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
    | 'cobblestone_embedded_asphalt'
    | 'brown_floor_tiles'
    | 'coral_fort_wall'
    | 'damaged_plaster'
    | 'cliff_side';
