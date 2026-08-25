import { describe, expect, it, vi } from 'vitest';

import { hitboxPresets } from '@/modules/combat';
import { getSoldierSkinById } from '@/modules/soldiers/get-soldier-skin-by-id';
import { soldierSkins } from '@/modules/soldiers/soldier-skin-registry';

// Preload fires on import; hoisted above imports so the data test stays loader-free.
vi.mock('@react-three/drei', () => ({
  useGLTF: { preload: vi.fn() },
}));

describe('soldier-skin-registry', () => {
  const swat1Skin = getSoldierSkinById('swat-1');
  const remySkin = getSoldierSkinById('remy');

  it('resolves the swat-1 GLB url', () => {
    expect(soldierSkins['swat-1']).toBeDefined();
    expect(swat1Skin.meshData.modelUrl).toBe('/assets/characters/soldiers/swat-1.glb');
  });

  it('resolves the remy GLB url', () => {
    expect(soldierSkins['remy']).toBeDefined();
    expect(remySkin.meshData.modelUrl).toBe('/assets/characters/civilians/remy.glb');
  });

  it('maps locomotion and action clip names for swat-1', () => {
    expect(swat1Skin.meshData.animations).toEqual({
      idle: 'idle',
      walk: 'walk',
      run: 'run',
      crouchWalking: 'crouch-walking',
      jump: 'jump',
      kneel: 'kneel',
      dying: 'dying',
    });
  });

  it('links shared animation pack for both skins', () => {
    expect(swat1Skin.meshData.sharedAnimationsUrl).toBe('/assets/characters/shared/base-animations.glb');
    expect(remySkin.meshData.sharedAnimationsUrl).toBe('/assets/characters/shared/base-animations.glb');
  });

  it('links a registered humanoid-standard hitbox preset', () => {
    expect(swat1Skin.hitboxPresetId).toBe('humanoid-standard');
    expect(hitboxPresets[swat1Skin.hitboxPresetId].parts.length).toBeGreaterThan(0);
  });
});
