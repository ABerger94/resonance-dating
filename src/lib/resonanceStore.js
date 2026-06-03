// Zustand store — ResonanceContext
// Manages threads, interactions, profiles, and seeder state

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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

      // --- Threads (local cache) ---
      threads: {},
      setThread: (thread) => set(state => ({
        threads: { ...state.threads, [thread.id]: thread }
      })),
      updateThreadScore: (threadId, score, state_val) => set(state => ({
        threads: {
          ...state.threads,
          [threadId]: {
            ...state.threads[threadId],
            resonance_score: score,
            resonance_state: state_val
          }
        }
      })),

      // --- Interactions (local cache per thread) ---
      interactions: {},
      addInteraction: (interaction) => set(state => {
        const threadId = interaction.thread_id;
        const existing = state.interactions[threadId] || [];
        return {
          interactions: {
            ...state.interactions,
            [threadId]: [...existing, interaction]
          }
        };
      }),
      setInteractions: (threadId, interactions) => set(state => ({
        interactions: {
          ...state.interactions,
          [threadId]: interactions
        }
      })),
      getInteractionsForThread: (threadId) => {
        return get().interactions[threadId] || [];
      },

      // --- Profiles cache ---
      profiles: {},
      setProfile: (profile) => set(state => ({
        profiles: { ...state.profiles, [profile.id || profile.mock_id]: profile }
      })),

      // --- Seeder state ---
      seederEnabled: false,
      setSeederEnabled: (val) => set({ seederEnabled: val }),

      // --- Dev toolbar ---
      devMode: false,
      devSelectedMockId: null,
      devOverrideScore: null,
      setDevMode: (val) => set({ devMode: val }),
      setDevSelectedMockId: (id) => set({ devSelectedMockId: id }),
      setDevOverrideScore: (score) => set({ devOverrideScore: score }),

      // --- Unlock animation tracking ---
      animatedUnlocks: {},
      markUnlockAnimated: (threadId, field) => set(state => ({
        animatedUnlocks: {
          ...state.animatedUnlocks,
          [threadId]: {
            ...(state.animatedUnlocks[threadId] || {}),
            [field]: true
          }
        }
      })),
      hasUnlockBeenAnimated: (threadId, field) => {
        return !!(get().animatedUnlocks[threadId]?.[field]);
      }
    }),
    {
      name: 'resonance-session',
      partialState: (state) => ({
        seederEnabled: state.seederEnabled,
        animatedUnlocks: state.animatedUnlocks,
        devMode: state.devMode
      })
    }
  )
);

export default useResonanceStore;