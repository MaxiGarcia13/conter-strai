import { describe, expect, it } from 'vitest';

import { LOBBY_PREVIEW_CIVILIAN_CLIP, LOBBY_PREVIEW_SOLDIER_CLIP } from '@/modules/lobby/constants/idle-fight';
import { resolveLobbyPreviewClipName } from '@/modules/lobby/utils/resolve-lobby-preview-clip-name';

describe('resolveLobbyPreviewClipName', () => {
  it('maps soldier skins to the fight clip', () => {
    expect(resolveLobbyPreviewClipName('swat-1')).toBe(LOBBY_PREVIEW_SOLDIER_CLIP);
    expect(resolveLobbyPreviewClipName('swat-2')).toBe(LOBBY_PREVIEW_SOLDIER_CLIP);
    expect(resolveLobbyPreviewClipName('swat-3')).toBe(LOBBY_PREVIEW_SOLDIER_CLIP);
  });

  it('maps civilian skins to looking-around', () => {
    expect(resolveLobbyPreviewClipName('remy')).toBe(LOBBY_PREVIEW_CIVILIAN_CLIP);
    expect(resolveLobbyPreviewClipName('james')).toBe(LOBBY_PREVIEW_CIVILIAN_CLIP);
    expect(resolveLobbyPreviewClipName('liza')).toBe(LOBBY_PREVIEW_CIVILIAN_CLIP);
  });
});
