import type { TextureDefinition, TextureId } from './types';
import { textures } from './texture-registry';

export function getTextureById(id: TextureId): TextureDefinition {
  if (!(id in textures)) {
    throw new Error(`Unknown texture id: ${id}`);
  }
  return textures[id];
}
