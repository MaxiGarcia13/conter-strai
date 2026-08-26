import { describe, expect, it, vi } from 'vitest';

import { hitboxPresets } from '@/modules/combat';
import { getSoldierSkinById } from '@/modules/soldiers/get-soldier-skin-by-id';
import { soldierSkins } from '@/modules/soldiers/soldier-skin-registry';

// Preload fires on import; hoisted above imports so the data test stays loader-free.
vi.mock('@react-three/drei', () => ({
  useGLTF: { preload: vi.fn() },
}));

const EXPECTED_URLS: Record<keyof typeof soldierSkins, string> = {
  'remy': '/assets/characters/civilians/remy.glb',
  'james': '/assets/characters/civilians/james.glb',
  'liza': '/assets/characters/civilians/liza.glb',
  'swat-1': '/assets/characters/soldiers/swat-1.glb',
  'swat-2': '/assets/characters/soldiers/swat-2.glb',
  'swat-3': '/assets/characters/soldiers/swat-3.glb',
};

const SHARED_CLIP_MAP = {
  idle: 'idle-shooting',
  walk: 'walk',
  run: 'run',
  crouchWalking: 'crouch-walking',
  jump: 'jump',
  kneel: 'kneel',
  dying: 'dying',
  reloading: 'reloading',
  reloadingKneel: 'reloading-kneel',
  shooting: 'shooting',
  hitReaction: 'hit-reaction',
};

describe('soldier-skin-registry', () => {
  it('registers all playable skin ids', () => {
    expect(Object.keys(soldierSkins).sort()).toEqual(Object.keys(EXPECTED_URLS).sort());
  });

  for (const [id, modelUrl] of Object.entries(EXPECTED_URLS)) {
    it(`resolves ${id} GLB url and shared pack`, () => {
      const skin = getSoldierSkinById(id as keyof typeof soldierSkins);
      expect(skin.meshData.modelUrl).toBe(modelUrl);
      expect(skin.meshData.sharedAnimationsUrl).toBe('/assets/characters/shared/base-animations.glb');
      expect(skin.meshData.animations).toEqual(SHARED_CLIP_MAP);
      expect(skin.hitboxPresetId).toBe('humanoid-standard');
      expect(hitboxPresets[skin.hitboxPresetId].parts.length).toBeGreaterThan(0);
    });
  }
});
