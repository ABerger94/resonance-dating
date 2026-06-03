import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useUserStore } from '@/stores/useUserStore';
import type { UserProfile } from '@/types/UserProfile';

interface ProfileContextValue {
  profile: UserProfile | null;
  isOnboarding: boolean;
  isReady: boolean;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const profile = useUserStore(state => state.profile);
  const hasHydrated = useUserStore(state => state.hasHydrated);

  const value = useMemo<ProfileContextValue>(() => ({
    profile,
    isOnboarding: !profile || profile.status === 'onboarding',
    isReady: hasHydrated,
  }), [hasHydrated, profile]);

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfileContext(): ProfileContextValue {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfileContext must be used inside ProfileProvider.');
  }
  return context;
}
