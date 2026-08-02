import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  clearAccessMenusCache,
  loadAccessMenusCache,
  saveAccessMenusCache,
} from './menu-cache';

function installMemoryLocalStorage() {
  const store = new Map<string, string>();
  const localStorageMock = {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => store.clear(),
  };
  vi.stubGlobal('localStorage', localStorageMock);
  vi.stubGlobal('window', { localStorage: localStorageMock });
}

describe('access menu cache', () => {
  beforeEach(() => {
    installMemoryLocalStorage();
    clearAccessMenusCache();
  });

  it('saves and loads menus for the same token', () => {
    const token = 'tok-aaaaaaaa-bbbbbbbb';
    const menus = [{ name: 'Dashboard', path: '/dashboard' }];
    saveAccessMenusCache(token, menus);
    expect(loadAccessMenusCache(token)).toEqual(menus);
  });

  it('misses when token fingerprint differs (new login)', () => {
    saveAccessMenusCache('tok-old-old-old-old', [{ name: 'A', path: '/a' }]);
    expect(loadAccessMenusCache('tok-new-new-new-new')).toBeNull();
  });

  it('clears on logout', () => {
    const token = 'tok-cccccccc-dddddddd';
    saveAccessMenusCache(token, [{ name: 'X', path: '/x' }]);
    clearAccessMenusCache();
    expect(loadAccessMenusCache(token)).toBeNull();
  });
});
