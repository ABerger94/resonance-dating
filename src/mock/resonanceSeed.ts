import type { ResonanceInteraction, Signal } from '@/engine/ResonanceEngine';
import type { UserProfile } from '@/types/UserProfile';

export const MOCK_CURRENT_PROFILE: UserProfile = {
  id: 'user_current',
  displayName: 'Avery',
  age: 31,
  sex: 'non_binary',
  location: 'Brooklyn, NY',
  datingPreferences: {
    minAge: 27,
    maxAge: 42,
    genderPreference: 'all',
    radiusMiles: 50,
  },
  status: 'active',
};

export const MOCK_SIGNALS: Signal[] = [
  {
    id: 'signal_locked',
    displayName: 'Mara',
    age: 29,
    sex: 'female',
    location: 'Queens, NY',
    datingPreferences: {
      minAge: 25,
      maxAge: 42,
      genderPreference: 'all',
      radiusMiles: 30,
    },
    status: 'active',
    lastActiveAt: new Date(Date.now() - 20 * 60_000).toISOString(),
  },
  {
    id: 'signal_resonating',
    displayName: 'Theo',
    age: 36,
    sex: 'male',
    location: 'Jersey City, NJ',
    datingPreferences: {
      minAge: 30,
      maxAge: 45,
      genderPreference: 'all',
      radiusMiles: 25,
    },
    status: 'active',
    lastActiveAt: new Date(Date.now() - 8 * 60_000).toISOString(),
  },
  {
    id: 'signal_filtered_age',
    displayName: 'Sam',
    age: 51,
    sex: 'other',
    location: 'Philadelphia, PA',
    datingPreferences: {
      minAge: 30,
      maxAge: 60,
      genderPreference: 'all',
      radiusMiles: 75,
    },
    status: 'active',
  },
  {
    id: 'signal_onboarding',
    displayName: 'Jordan',
    age: 33,
    sex: 'non_binary',
    location: 'Hoboken, NJ',
    datingPreferences: {
      minAge: 25,
      maxAge: 40,
      genderPreference: 'all',
      radiusMiles: 20,
    },
    status: 'onboarding',
  },
];

export const MOCK_LOCKED_INTERACTIONS: ResonanceInteraction[] = [
  {
    id: 'locked_1',
    threadId: 'thread_locked',
    senderId: 'user_current',
    recipientId: 'signal_locked',
    content: 'Hey, this prompt is interesting.',
    createdAt: new Date(Date.now() - 60 * 60_000).toISOString(),
    responseLatencyMs: 3_600_000,
  },
];

export const MOCK_RESONATING_INTERACTIONS: ResonanceInteraction[] = [
  {
    id: 'resonating_1',
    threadId: 'thread_resonating',
    senderId: 'user_current',
    recipientId: 'signal_resonating',
    content: 'I love how this question asks for honesty instead of performance. My real answer is that connection starts when both people get specific.',
    createdAt: new Date(Date.now() - 42 * 60_000).toISOString(),
    responseLatencyMs: 90_000,
  },
  {
    id: 'resonating_2',
    threadId: 'thread_resonating',
    senderId: 'signal_resonating',
    recipientId: 'user_current',
    content: 'That is thoughtful. I am curious about the line between being specific and being too polished, because vulnerability can become a costume.',
    createdAt: new Date(Date.now() - 35 * 60_000).toISOString(),
    responseLatencyMs: 120_000,
  },
  {
    id: 'resonating_3',
    threadId: 'thread_resonating',
    senderId: 'user_current',
    recipientId: 'signal_resonating',
    content: 'The costume point is meaningful. I trust answers more when they contain a small contradiction, because people are rarely one clean thesis.',
    createdAt: new Date(Date.now() - 24 * 60_000).toISOString(),
    responseLatencyMs: 105_000,
  },
  {
    id: 'resonating_4',
    threadId: 'thread_resonating',
    senderId: 'signal_resonating',
    recipientId: 'user_current',
    content: 'Exactly. A beautiful answer usually has texture: a value, a memory, and a little unresolved tension that leaves room to keep talking.',
    createdAt: new Date(Date.now() - 12 * 60_000).toISOString(),
    responseLatencyMs: 80_000,
  },
];
