// ResonanceContext — global state using React Context + localStorage persistence
import { createContext, useContext, useState, useEffect } from 'react';

const ResonanceContext = createContext(null);

function loadFromStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(`resonance:${key}`);
    return raw !== null ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage(key, value) {
  try {
    localStorage.setItem(`resonance:${key}`, JSON.stringify(value));
  } catch {}
}

export function ResonanceProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentProfile, setCurrentProfile] = useState(null);
  const [activeThreadId, setActiveThreadId] = useState(null);
  const [threads, setThreads] = useState({});
  const [interactions, setInteractions] = useState({});
  const [profiles, setProfiles] = useState({});
  const [animatedUnlocks, setAnimatedUnlocks] = useState(() => loadFromStorage('animatedUnlocks', {}));
  const [seederEnabled, _setSeederEnabled] = useState(() => loadFromStorage('seederEnabled', false));
  const [devMode, _setDevMode] = useState(() => loadFromStorage('devMode', false));
  const [devSelectedMockId, setDevSelectedMockId] = useState(null);
  const [devOverrideScore, setDevOverrideScore] = useState(null);

  const setSeederEnabled = (val) => {
    _setSeederEnabled(val);
    saveToStorage('seederEnabled', val);
  };

  const setDevMode = (val) => {
    _setDevMode(val);
    saveToStorage('devMode', val);
  };

  const setThread = (thread) => setThreads(prev => ({ ...prev, [thread.id]: thread }));

  const updateThreadScore = (threadId, score, state_val) =>
    setThreads(prev => ({
      ...prev,
      [threadId]: { ...prev[threadId], resonance_score: score, resonance_state: state_val }
    }));

  const addInteraction = (interaction) =>
    setInteractions(prev => {
      const threadId = interaction.thread_id;
      return { ...prev, [threadId]: [...(prev[threadId] || []), interaction] };
    });

  const setInteractionsForThread = (threadId, ints) =>
    setInteractions(prev => ({ ...prev, [threadId]: ints }));

  const getInteractionsForThread = (threadId) => interactions[threadId] || [];

  const setProfile = (profile) =>
    setProfiles(prev => ({ ...prev, [profile.id || profile.mock_id]: profile }));

  const markUnlockAnimated = (threadId, field) => {
    setAnimatedUnlocks(prev => {
      const next = { ...prev, [threadId]: { ...(prev[threadId] || {}), [field]: true } };
      saveToStorage('animatedUnlocks', next);
      return next;
    });
  };

  const hasUnlockBeenAnimated = (threadId, field) => !!(animatedUnlocks[threadId]?.[field]);

  const value = {
    currentUser, setCurrentUser,
    currentProfile, setCurrentProfile,
    activeThreadId, setActiveThreadId,
    threads, setThread, updateThreadScore,
    interactions, addInteraction, setInteractionsForThread, getInteractionsForThread,
    profiles, setProfile,
    animatedUnlocks, markUnlockAnimated, hasUnlockBeenAnimated,
    seederEnabled, setSeederEnabled,
    devMode, setDevMode,
    devSelectedMockId, setDevSelectedMockId,
    devOverrideScore, setDevOverrideScore,
  };

  return <ResonanceContext.Provider value={value}>{children}</ResonanceContext.Provider>;
}

export default function useResonanceStore() {
  const ctx = useContext(ResonanceContext);
  if (!ctx) throw new Error('useResonanceStore must be used within ResonanceProvider');
  return ctx;
}