import { create } from 'zustand';

/**
 * Bumps when menus/roles change so AppRouter rebuilds accessible routes.
 * Not persisted — in-session only.
 */
interface AccessRefreshState {
  version: number;
  /** Invalidate runtime menus/routes (re-fetch /menu/all + rebuild router). */
  refreshAccess: () => void;
}

export const useAccessRefreshStore = create<AccessRefreshState>((set) => ({
  version: 0,
  refreshAccess: () => set((s) => ({ version: s.version + 1 })),
}));
