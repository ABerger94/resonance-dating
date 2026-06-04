import { createContext, useContext, useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import useResonanceStore from '@/lib/resonanceStore';

const ProfileContext = createContext(null);

export function ProfileProvider({ children, user }) {
  const [profile, setProfile] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const setCurrentProfile = useResonanceStore(s => s.setCurrentProfile);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setIsReady(true);
      return;
    }
    fetchProfile(user.id);
  }, [user?.id]);

  const fetchProfile = async (userId) => {
    try {
      const results = await base44.entities.UserProfile.filter({ user_id: userId }, '-created_date', 1);
      const found = results[0] || null;
      setProfile(found);
      if (found) setCurrentProfile(found);
    } catch (e) {
      console.error('Failed to fetch profile:', e);
      setProfile(null);
    } finally {
      setIsReady(true);
    }
  };

  const refreshProfile = (newProfile) => {
    setProfile(newProfile);
    if (newProfile) setCurrentProfile(newProfile);
  };

  return (
    <ProfileContext.Provider value={{ profile, isReady, refreshProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfileContext() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfileContext must be used inside ProfileProvider');
  return ctx;
}