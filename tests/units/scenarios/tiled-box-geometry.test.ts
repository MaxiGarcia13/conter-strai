import { BoxGeometry, BufferAttribute } from 'three';
import { describe, expect, it } from 'vitest';

import { createTiledBoxGeometry } from '@/modules/scenarios/hooks/use-scenario-material';

describe('createTiledBoxGeometry', () => {
  it('tiles end-caps by thickness and long faces by length', () => {
    const geometry = createTiledBoxGeometry(8, 4, 0.5, 4);
    const uv = geometry.getAttribute('uv');
    expect(uv).toBeInstanceOf(BufferAttribute);

    // +x end-cap (verts 0-3): U scales by depth/tile = 0.125, V by height/tile = 1
    expect(uv.getX(0)).toBeCloseTo(0);
    expect(uv.getY(0)).toBeCloseTo(1);
    expect(uv.getX(1)).toBeCloseTo(0.125);
    expect(uv.getY(1)).toBeCloseTo(1);

    // +z long face (verts 16-19): U scales by width/tile = 2, V by height/tile = 1
    expect(uv.getX(16)).toBeCloseTo(0);
    expect(uv.getY(16)).toBeCloseTo(1);
    expect(uv.getX(17)).toBeCloseTo(2);
    expect(uv.getY(17)).toBeCloseTo(1);
  });

  it('matches an untitled box vertex count', () => {
    const tiled = createTiledBoxGeometry(1, 2, 3, 4);
    const raw = new BoxGeometry(1, 2, 3);
    expect(tiled.getAttribute('uv').count).toBe(raw.getAttribute('uv').count);
  });
});
