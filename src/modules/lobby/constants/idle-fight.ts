import { glbCdnUrl } from '@/utils/glb-cdn-url';

export const LOBBY_PREVIEW_ANIMATIONS_URL = glbCdnUrl(
  '/characters/shared/character-preview-animation.glb',
);

/** On-disk clip names in `character-preview-animation.glb`. */
export const LOBBY_PREVIEW_SOLDIER_CLIP = 'figth';
export const LOBBY_PREVIEW_CIVILIAN_CLIP = 'looking-around';
