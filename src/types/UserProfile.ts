export type ProfileStatus = 'active' | 'onboarding';

export type Sex = 'female' | 'male' | 'non_binary' | 'other';

export type GenderPreference = Sex | 'all';

export interface DatingPreferences {
  minAge: number;
  maxAge: number;
  genderPreference: GenderPreference;
  radiusMiles: number;
}

export interface UserProfile {
  id: string;
  displayName: string;
  age: number;
  sex: Sex;
  location: string;
  datingPreferences: DatingPreferences;
  status: ProfileStatus;
}

export type UserProfileDraft = Omit<UserProfile, 'id' | 'status'> & {
  id?: string;
  status?: ProfileStatus;
};

export type ProfileValidationErrors = Partial<Record<
  keyof UserProfile | keyof DatingPreferences,
  string
>>;

export const MIN_PROFILE_AGE = 18;
export const MAX_PROFILE_AGE = 120;

export const DEFAULT_DATING_PREFERENCES: DatingPreferences = {
  minAge: 18,
  maxAge: 45,
  genderPreference: 'all',
  radiusMiles: 50,
};

export const createEmptyUserProfileDraft = (): UserProfileDraft => ({
  displayName: '',
  age: 18,
  sex: 'other',
  location: '',
  datingPreferences: DEFAULT_DATING_PREFERENCES,
});
