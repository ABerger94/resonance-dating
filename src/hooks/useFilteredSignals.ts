import { useMemo } from 'react';
import { filterSignalsForProfile, type Signal } from '@/engine/ResonanceEngine';
import { useUserStore } from '@/stores/useUserStore';

export function useFilteredSignals(signals: Signal[]): Signal[] {
  const profile = useUserStore(state => state.profile);

  return useMemo(() => {
    return filterSignalsForProfile(profile, signals);
  }, [profile, signals]);
}
