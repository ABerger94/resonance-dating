const MIN_AGE = 18;
const MAX_AGE = 120;

const SEX_OPTIONS = ['female', 'male', 'non_binary', 'other'];
const GENDER_PREFERENCE_OPTIONS = ['all', ...SEX_OPTIONS];

export function clampAge(value, fallback = MIN_AGE) {
  const age = Number(value);
  if (!Number.isFinite(age)) return fallback;
  return Math.max(MIN_AGE, Math.min(MAX_AGE, Math.round(age)));
}

export function normalizeSex(value) {
  return SEX_OPTIONS.includes(value) ? value : 'other';
}

export function normalizeGenderPreference(value) {
  return GENDER_PREFERENCE_OPTIONS.includes(value) ? value : 'all';
}

export function normalizePreferenceAges(minAge, maxAge) {
  const min = clampAge(minAge, MIN_AGE);
  const max = clampAge(maxAge, 45);
  return min <= max ? { minAge: min, maxAge: max } : { minAge: max, maxAge: min };
}

export function isWithinDatingPreferences(viewerProfile, candidateProfile) {
  if (!viewerProfile || !candidateProfile) return true;
  const candidateAge = Number(candidateProfile.age);
  const { minAge, maxAge } = normalizePreferenceAges(
    viewerProfile.preference_min_age,
    viewerProfile.preference_max_age
  );
  const genderPreference = normalizeGenderPreference(viewerProfile.preference_gender);
  const ageMatches = Number.isFinite(candidateAge)
    ? candidateAge >= minAge && candidateAge <= maxAge
    : true;
  const sexMatches = candidateProfile.sex
    ? genderPreference === 'all' || normalizeSex(candidateProfile.sex) === genderPreference
    : true;

  return ageMatches && sexMatches;
}

export {
  GENDER_PREFERENCE_OPTIONS,
  MAX_AGE,
  MIN_AGE,
  SEX_OPTIONS
};
