import type { SoldierSkinId } from '@/modules/soldiers';
import { TEAM_SKINS } from '@/modules/teams';
import { LOBBY_PREVIEW_CIVILIAN_CLIP, LOBBY_PREVIEW_SOLDIER_CLIP } from '../constants/idle-fight';

export function resolveLobbyPreviewClipName(skinId: SoldierSkinId): string {
  return TEAM_SKINS.soldier.includes(skinId)
    ? LOBBY_PREVIEW_SOLDIER_CLIP
    : LOBBY_PREVIEW_CIVILIAN_CLIP;
}
