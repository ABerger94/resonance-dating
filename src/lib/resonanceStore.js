// ResonanceContext — Zustand store with localStorage persistence
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { isDevToolsEnabled } from '@/lib/security';

const useResonanceStore = create(
  persist(
    (set, get) => ({
      // --- Auth/User ---
      currentUser: null,
      currentProfile: null,
      setCurrentUser: (user) => set({ currentUser: user }),
      setCurrentProfile: (profile) => set({ currentProfile: profile }),

      // --- Active Thread ---
      activeThreadId: null,
      setActiveThreadId: (id) => set({ activeThreadId: id }),

      // --- Seeder + Dev ---
      seederEnabled: false,
      setSeederEnabled: (val) => set({ seederEnabled: val }),
      devMode: false,
      setDevMode: (val) => set({ devMode: val }),
      devSelectedMockId: null,
      setDevSelectedMockId: (id) => set({ devSelectedMockId: id }),
      devOverrideScore: null,
      setDevOverrideScore: (score) => set({ devOverrideScore: score }),

      // --- Unlock animation tracking ---
      animatedUnlocks: {},
      markUnlockAnimated: (threadId, field) => set((state) => ({
        animatedUnlocks: {
          ...state.animatedUnlocks,
          [threadId]: { ...(state.animatedUnlocks[threadId] || {}), [field]: true }
        }
      })),
      hasUnlockBeenAnimated: (threadId, field) => {
        return !!(get().animatedUnlocks[threadId]?.[field]);
      }
    }),
    {
      name: 'resonance-session',
      partialize: (state) => ({
        seederEnabled: isDevToolsEnabled() ? state.seederEnabled : false,
        devMode: isDevToolsEnabled() ? state.devMode : false,
        animatedUnlocks: state.animatedUnlocks
      })
    }
  )
);

export default useResonanceStore;
