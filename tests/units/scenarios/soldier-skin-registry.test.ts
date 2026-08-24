import { describe, expect, it, vi } from 'vitest';

import { hitboxPresets } from '@/modules/combat';
import { getSoldierSkinById } from '@/modules/soldiers/get-soldier-skin-by-id';
import { soldierSkins } from '@/modules/soldiers/soldier-skin-registry';

// Preload fires on import; hoisted above imports so the data test stays loader-free.
vi.mock('@react-three/drei', () => ({
  useGLTF: { preload: vi.fn() },
}));

describe('soldier-skin-registry', () => {
  const skin = getSoldierSkinById('swat-guy');

  it('resolves the swat-guy GLB url', () => {
    expect(soldierSkins['swat-guy']).toBeDefined();
    expect(skin.meshData.modelUrl).toBe('/assets/soldiers/swat-soldier.glb');
  });

  it('maps locomotion and action clip names', () => {
    expect(skin.meshData.animations).toEqual({
      idle: 'idle',
      walk: 'walk',
      run: 'run',
      jump: 'jump',
      kneel: 'kneel',
      reloading: 'reloading',
      shooting: 'shooting',
    });
  });

  it('links a registered humanoid-standard hitbox preset', () => {
    expect(skin.hitboxPresetId).toBe('humanoid-standard');
    expect(hitboxPresets[skin.hitboxPresetId].parts.length).toBeGreaterThan(0);
  });
});
