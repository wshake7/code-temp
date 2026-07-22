import {create} from 'zustand';
import {persist} from 'zustand/middleware';

import {defaultPreferences} from '../config/default';
import type {DeepPartial, Preferences} from '../types';
import {mergeDeep} from "../utils/merge";

export interface PreferencesState {
    preferences: Preferences;
    setPreferences: (overrides: DeepPartial<Preferences>) => void;
    resetPreferences: () => void;
    getPreference: <K extends keyof Preferences>(key: K) => Preferences[K];
}

/**
 * accessMode 由 VITE_ACCESS_MODE 控制（部署配置）。
 * rehydrate 时强制覆盖 localStorage，避免历史 frontend 导致永不请求 /menu/all。
 */
function withEnvAccessMode(preferences: Preferences): Preferences {
  return {
    ...preferences,
    app: {
      ...preferences.app,
      accessMode: defaultPreferences.app.accessMode,
    },
  };
}

export const usePreferencesStore = create<PreferencesState>()(
    persist(
        (set, get) => ({
            preferences: defaultPreferences,

            setPreferences: (overrides) => {
                set((state) => ({
                    preferences: mergeDeep(state.preferences, overrides),
                }));
            },

            resetPreferences: () => {
                set({preferences: defaultPreferences});
            },

            getPreference: (key) => {
                return get().preferences[key];
            },
        }),
        {
            name: 'app-preferences',
            partialize: (state) => ({preferences: state.preferences}),
            merge: (persistedState, currentState) => {
                const persisted = persistedState as
                    | Partial<PreferencesState>
                    | undefined;
                if (!persisted?.preferences) {
                    return {
                        ...currentState,
                        preferences: withEnvAccessMode(currentState.preferences),
                    };
                }
                const merged = mergeDeep(
                    currentState.preferences,
                    persisted.preferences,
                );
                return {
                    ...currentState,
                    ...persisted,
                    preferences: withEnvAccessMode(merged),
                };
            },
        }
    )
);
