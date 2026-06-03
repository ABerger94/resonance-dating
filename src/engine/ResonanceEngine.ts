import type { GenderPreference, UserProfile } from '@/types/UserProfile';

export type ResonanceState = 'locked' | 'discovering' | 'resonating';

export interface ResonanceInteraction {
  id: string;
  threadId: string;
  senderId: string;
  recipientId?: string;
  content: string;
  createdAt: string;
  responseLatencyMs?: number;
}

export interface ResonanceAnalysis {
  wordCount: number;
  uniqueWordRatio: number;
  averageWordLength: number;
  sentenceCount: number;
  sentimentScore: number;
  complexityScore: number;
}

export interface ResonanceScoreBreakdown {
  frequency: number;
  latency: number;
  sentiment: number;
  complexity: number;
}

export interface ResonanceResult {
  score: number;
  state: ResonanceState;
  breakdown: ResonanceScoreBreakdown;
  unlockedFields: ProfileUnlockMap;
}

export type ProfileUnlockMap = Record<keyof Pick<
  UserProfile,
  'displayName' | 'age' | 'sex' | 'location' | 'datingPreferences'
>, boolean>;

export interface Signal extends UserProfile {
  lastActiveAt?: string;
  interactionPreview?: ResonanceInteraction[];
  latitude?: number;
  longitude?: number;
}

const POSITIVE_KEYWORDS = new Set([
  'love',
  'curious',
  'thoughtful',
  'honest',
  'beautiful',
  'meaningful',
  'fascinating',
  'excited',
  'kind',
  'generous',
  'inspired',
  'connect',
]);

const NEGATIVE_KEYWORDS = new Set([
  'hate',
  'boring',
  'awful',
  'terrible',
  'pointless',
  'rude',
  'angry',
  'gross',
  'stupid',
  'worst',
]);

export function analyzeContent(content: string): ResonanceAnalysis {
  const words = content.trim().split(/\s+/).filter(Boolean);
  const normalizedWords = words.map(word => word.toLowerCase().replace(/[^a-z]/g, '')).filter(Boolean);
  const uniqueWords = new Set(normalizedWords);
  const sentenceCount = Math.max(content.split(/[.!?]+/).filter(Boolean).length, 1);
  const totalLetters = normalizedWords.reduce((sum, word) => sum + word.length, 0);

  const rawSentiment = normalizedWords.reduce((score, word) => {
    if (POSITIVE_KEYWORDS.has(word)) return score + 1;
    if (NEGATIVE_KEYWORDS.has(word)) return score - 1;
    return score;
  }, 0);

  const wordCount = words.length;
  const uniqueWordRatio = wordCount > 0 ? uniqueWords.size / wordCount : 0;
  const averageWordLength = normalizedWords.length > 0 ? totalLetters / normalizedWords.length : 0;
  const sentenceDepth = Math.min(wordCount / sentenceCount / 24, 1);
  const vocabularyDepth = Math.min(uniqueWordRatio, 1);
  const wordDepth = Math.min(averageWordLength / 7, 1);
  const complexityScore = Math.round(((sentenceDepth * 0.35) + (vocabularyDepth * 0.45) + (wordDepth * 0.20)) * 100);

  return {
    wordCount,
    uniqueWordRatio,
    averageWordLength,
    sentenceCount,
    sentimentScore: Math.max(-1, Math.min(1, rawSentiment / 5)),
    complexityScore,
  };
}

export function getResonanceState(score: number): ResonanceState {
  if (score >= 70) return 'resonating';
  if (score >= 25) return 'discovering';
  return 'locked';
}

export function getUnlockedProfileFields(score: number): ProfileUnlockMap {
  return {
    displayName: score >= 25,
    location: score >= 40,
    age: score >= 55,
    sex: score >= 55,
    datingPreferences: score >= 80,
  };
}

function normalizeScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function calculateFrequencyScore(interactions: ResonanceInteraction[]): number {
  if (interactions.length === 0) return 0;
  const timestamps = interactions
    .map(interaction => new Date(interaction.createdAt).getTime())
    .filter(Number.isFinite)
    .sort((a, b) => a - b);
  const first = timestamps[0] ?? Date.now();
  const last = timestamps[timestamps.length - 1] ?? first;
  const activeDays = Math.max((last - first) / 86_400_000, 1);
  const messagesPerDay = interactions.length / activeDays;

  return normalizeScore(Math.min(messagesPerDay / 8, 1) * 100);
}

function calculateLatencyScore(interactions: ResonanceInteraction[]): number {
  const latencies = interactions
    .map(interaction => interaction.responseLatencyMs)
    .filter((latency): latency is number => typeof latency === 'number' && latency > 0);

  if (latencies.length === 0) return 35;
  const averageLatency = latencies.reduce((sum, latency) => sum + latency, 0) / latencies.length;

  if (averageLatency <= 120_000) return 100;
  if (averageLatency <= 300_000) return 85;
  if (averageLatency <= 900_000) return 65;
  if (averageLatency <= 1_800_000) return 45;
  if (averageLatency <= 86_400_000) return 25;
  return 10;
}

function calculateSentimentScore(interactions: ResonanceInteraction[]): number {
  if (interactions.length === 0) return 0;
  const averageSentiment = interactions
    .map(interaction => analyzeContent(interaction.content).sentimentScore)
    .reduce((sum, score) => sum + score, 0) / interactions.length;

  return normalizeScore(((averageSentiment + 1) / 2) * 100);
}

function calculateComplexityScore(interactions: ResonanceInteraction[]): number {
  if (interactions.length === 0) return 0;
  const averageComplexity = interactions
    .map(interaction => analyzeContent(interaction.content).complexityScore)
    .reduce((sum, score) => sum + score, 0) / interactions.length;

  return normalizeScore(averageComplexity);
}

export function calculateResonanceScore(interactions: ResonanceInteraction[]): ResonanceResult {
  const breakdown: ResonanceScoreBreakdown = {
    frequency: calculateFrequencyScore(interactions),
    latency: calculateLatencyScore(interactions),
    sentiment: calculateSentimentScore(interactions),
    complexity: calculateComplexityScore(interactions),
  };
  const score = normalizeScore(
    (breakdown.frequency * 0.25) +
    (breakdown.latency * 0.20) +
    (breakdown.sentiment * 0.20) +
    (breakdown.complexity * 0.35)
  );

  return {
    score,
    state: getResonanceState(score),
    breakdown,
    unlockedFields: getUnlockedProfileFields(score),
  };
}

function matchesGenderPreference(candidateSex: UserProfile['sex'], preference: GenderPreference): boolean {
  return preference === 'all' || candidateSex === preference;
}

function coordinatesForLocation(location: string): { latitude: number; longitude: number } | null {
  const known: Record<string, { latitude: number; longitude: number }> = {
    'brooklyn, ny': { latitude: 40.6782, longitude: -73.9442 },
    'queens, ny': { latitude: 40.7282, longitude: -73.7949 },
    'new york, ny': { latitude: 40.7128, longitude: -74.0060 },
    'jersey city, nj': { latitude: 40.7178, longitude: -74.0431 },
    'philadelphia, pa': { latitude: 39.9526, longitude: -75.1652 },
    'los angeles, ca': { latitude: 34.0522, longitude: -118.2437 },
    'san francisco, ca': { latitude: 37.7749, longitude: -122.4194 },
    'chicago, il': { latitude: 41.8781, longitude: -87.6298 },
  };
  const match = location.match(/^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/);
  if (match) return { latitude: Number(match[1]), longitude: Number(match[2]) };
  return known[location.trim().toLowerCase()] ?? null;
}

function distanceMiles(
  origin: { latitude: number; longitude: number },
  destination: { latitude: number; longitude: number }
): number {
  const toRadians = (degrees: number) => degrees * Math.PI / 180;
  const dLat = toRadians(destination.latitude - origin.latitude);
  const dLon = toRadians(destination.longitude - origin.longitude);
  const lat1 = toRadians(origin.latitude);
  const lat2 = toRadians(destination.latitude);
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 3958.8 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function matchesRadius(userProfile: UserProfile, signal: Signal): boolean {
  const origin = coordinatesForLocation(userProfile.location);
  const destination = typeof signal.latitude === 'number' && typeof signal.longitude === 'number'
    ? { latitude: signal.latitude, longitude: signal.longitude }
    : coordinatesForLocation(signal.location);
  if (!origin) return true;
  if (!destination) return false;
  return distanceMiles(origin, destination) <= userProfile.datingPreferences.radiusMiles;
}

export function isSignalCompatible(userProfile: UserProfile, signal: Signal): boolean {
  if (signal.status !== 'active') return false;
  if (signal.id === userProfile.id) return false;

  const { minAge, maxAge, genderPreference } = userProfile.datingPreferences;
  return signal.age >= minAge &&
    signal.age <= maxAge &&
    matchesGenderPreference(signal.sex, genderPreference) &&
    matchesRadius(userProfile, signal);
}

export function filterSignalsForProfile(userProfile: UserProfile | null, signals: Signal[]): Signal[] {
  if (!userProfile || userProfile.status !== 'active') return [];
  return signals.filter(signal => isSignalCompatible(userProfile, signal));
}

export function revealProfileFields(profile: UserProfile, score: number): Partial<UserProfile> {
  const unlocked = getUnlockedProfileFields(score);
  return {
    id: profile.id,
    displayName: unlocked.displayName ? profile.displayName : undefined,
    location: unlocked.location ? profile.location : undefined,
    age: unlocked.age ? profile.age : undefined,
    sex: unlocked.sex ? profile.sex : undefined,
    datingPreferences: unlocked.datingPreferences ? profile.datingPreferences : undefined,
    status: profile.status,
  };
}

export const ResonanceEngine = {
  analyzeContent,
  calculateResonanceScore,
  filterSignalsForProfile,
  getResonanceState,
  getUnlockedProfileFields,
  isSignalCompatible,
  revealProfileFields,
};
