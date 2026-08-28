import { vi } from 'vitest';

export function mockSessionStorage(): void {
  const storage = new Map<string, string>();

  vi.stubGlobal('sessionStorage', {
    get length() {
      return storage.size;
    },
    key(index: number) {
      return [...storage.keys()][index] ?? null;
    },
    getItem(key: string) {
      return storage.get(key) ?? null;
    },
    setItem(key: string, value: string) {
      storage.set(key, value);
    },
    removeItem(key: string) {
      storage.delete(key);
    },
    clear() {
      storage.clear();
    },
  });
}

export function unmockSessionStorage(): void {
  vi.unstubAllGlobals();
}
