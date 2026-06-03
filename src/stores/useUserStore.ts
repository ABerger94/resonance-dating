import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import {
  DEFAULT_DATING_PREFERENCES,
  MAX_PROFILE_AGE,
  MIN_PROFILE_AGE,
  type DatingPreferences,
  type ProfileValidationErrors,
  type UserProfile,
  type UserProfileDraft,
} from '@/types/UserProfile';

const USER_STORE_VERSION = 1;

export interface UserState {
  profile: UserProfile | null;
  hasHydrated: boolean;
  createProfile: (draft: UserProfileDraft) => UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => UserProfile | null;
  updateDatingPreferences: (updates: Partial<DatingPreferences>) => UserProfile | null;
  deleteProfile: () => void;
  setOnboarding: () => void;
  setActive: () => void;
  setHasHydrated: (hasHydrated: boolean) => void;
}

export function validateUserProfileDraft(draft: UserProfileDraft): ProfileValidationErrors {
  const errors: ProfileValidationErrors = {};
  const prefs = draft.datingPreferences ?? DEFAULT_DATING_PREFERENCES;

  if (!draft.displayName?.trim()) errors.displayName = 'Display name is required.';
  if (!Number.isInteger(draft.age) || draft.age < MIN_PROFILE_AGE || draft.age > MAX_PROFILE_AGE) {
    errors.age = `Age must be between ${MIN_PROFILE_AGE} and ${MAX_PROFILE_AGE}.`;
  }
  if (!draft.sex) errors.sex = 'Sex is required.';
  if (!draft.location?.trim()) errors.location = 'Location is required.';
  if (!Number.isInteger(prefs.minAge) || prefs.minAge < MIN_PROFILE_AGE) {
    errors.minAge = `Minimum age must be ${MIN_PROFILE_AGE} or older.`;
  }
  if (!Number.isInteger(prefs.maxAge) || prefs.maxAge > MAX_PROFILE_AGE) {
    errors.maxAge = `Maximum age must be ${MAX_PROFILE_AGE} or younger.`;
  }
  if (prefs.minAge > prefs.maxAge) errors.maxAge = 'Maximum age must be greater than minimum age.';
  if (!prefs.genderPreference) errors.genderPreference = 'Gender preference is required.';
  if (!Number.isInteger(prefs.radiusMiles) || prefs.radiusMiles < 1 || prefs.radiusMiles > 500) {
    errors.radiusMiles = 'Radius must be between 1 and 500 miles.';
  }

  return errors;
}

export function isUserProfileDraftValid(draft: UserProfileDraft): boolean {
  return Object.keys(validateUserProfileDraft(draft)).length === 0;
}

function createProfileId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `profile_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function normalizeProfileDraft(draft: UserProfileDraft): UserProfile {
  const errors = validateUserProfileDraft(draft);
  if (Object.keys(errors).length > 0) {
    throw new Error(Object.values(errors)[0] ?? 'Invalid profile data.');
  }

  return {
    id: draft.id ?? createProfileId(),
    displayName: draft.displayName.trim(),
    age: draft.age,
    sex: draft.sex,
    location: draft.location.trim(),
    datingPreferences: {
      minAge: draft.datingPreferences.minAge,
      maxAge: draft.datingPreferences.maxAge,
      genderPreference: draft.datingPreferences.genderPreference,
      radiusMiles: draft.datingPreferences.radiusMiles,
    },
    status: draft.status ?? 'active',
  };
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      profile: null,
      hasHydrated: false,
      createProfile: (draft) => {
        const profile = normalizeProfileDraft({ ...draft, status: draft.status ?? 'active' });
        set({ profile });
        return profile;
      },
      updateProfile: (updates) => {
        const current = get().profile;
        if (!current) return null;
        const profile = normalizeProfileDraft({
          ...current,
          ...updates,
          datingPreferences: {
            ...current.datingPreferences,
            ...(updates.datingPreferences ?? {}),
          },
        });
        set({ profile });
        return profile;
      },
      updateDatingPreferences: (updates) => {
        const current = get().profile;
        if (!current) return null;
        const profile = normalizeProfileDraft({
          ...current,
          datingPreferences: {
            ...current.datingPreferences,
            ...updates,
          },
        });
        set({ profile });
        return profile;
      },
      deleteProfile: () => set({ profile: null }),
      setOnboarding: () => {
        const current = get().profile;
        if (current) set({ profile: { ...current, status: 'onboarding' } });
      },
      setActive: () => {
        const current = get().profile;
        if (current) set({ profile: { ...current, status: 'active' } });
      },
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
    }),
    {
      name: 'resonance-user-state',
      version: USER_STORE_VERSION,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ profile: state.profile }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
