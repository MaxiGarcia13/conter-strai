import { vi } from 'vitest';

/**
 * Registries call `useGLTF.preload` on import. In Node that hits Three's FileLoader
 * and throws unhandled rejections (`ProgressEvent is not defined`). Stub preload globally.
 */
vi.mock('@react-three/drei', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@react-three/drei')>();
  return {
    ...actual,
    useGLTF: Object.assign(vi.fn(), { preload: vi.fn() }),
  };
});
