import { useCallback, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import {
  DEFAULT_DATING_PREFERENCES,
  createEmptyUserProfileDraft,
} from '@/types/UserProfile';
import { useUserStore, validateUserProfileDraft } from '@/stores/useUserStore';
import useResonanceStore from '@/lib/resonanceStore';
import { useNavigate } from 'react-router-dom';

const steps = ['Identity', 'Location', 'Preferences'];

function numberFromInput(value) {
  return Number.parseInt(value, 10);
}

export default function OnboardingFlow() {
  const createProfile = useUserStore(state => state.createProfile);
  const setCurrentProfile = useResonanceStore(state => state.setCurrentProfile);
  const navigate = useNavigate();
  const [stepIndex, setStepIndex] = useState(0);
  const [draft, setDraft] = useState(createEmptyUserProfileDraft);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const step = steps[stepIndex];
  const validationErrors = useMemo(() => validateUserProfileDraft(draft), [draft]);

  const updateDraft = useCallback((updates) => {
    setDraft(current => ({ ...current, ...updates }));
    setErrors({});
  }, []);

  const updatePreferences = useCallback((updates) => {
    setDraft(current => ({
      ...current,
      datingPreferences: {
        ...DEFAULT_DATING_PREFERENCES,
        ...current.datingPreferences,
        ...updates,
      },
    }));
    setErrors({});
  }, []);

  const canAdvance = useMemo(() => {
    if (step === 'Identity') return !validationErrors.displayName && !validationErrors.age && !validationErrors.sex;
    if (step === 'Location') return !validationErrors.location;
    return Object.keys(validationErrors).length === 0;
  }, [step, validationErrors]);

  const handleNext = useCallback(() => {
    if (!canAdvance) {
      setErrors(validationErrors);
      return;
    }
    setStepIndex(current => Math.min(current + 1, steps.length - 1));
  }, [canAdvance, validationErrors]);

  const handleBack = useCallback(() => {
    setStepIndex(current => Math.max(current - 1, 0));
  }, []);

  const handleSubmit = useCallback(async () => {
    const nextErrors = validateUserProfileDraft(draft);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    
    setIsSubmitting(true);
    try {
      // Get current authenticated user
      const user = await base44.auth.me();
      
      // Generate a unique handle
      const handle = `SIGNAL_${Math.floor(Math.random() * 10000)}`;
      
      // Create UserProfile record in Base44 database
      const profileData = {
        user_id: user.id,
        handle: handle,
        age: draft.age,
        sex: draft.sex,
        location: draft.location,
        preference_min_age: draft.datingPreferences.minAge,
        preference_max_age: draft.datingPreferences.maxAge,
        preference_gender: draft.datingPreferences.genderPreference,
        match_radius_miles: draft.datingPreferences.radiusMiles,
        tag_cloud: [],
      };
      
      await base44.entities.UserProfile.create(profileData);
      
      // Update local Zustand stores
      const profile = createProfile({ ...draft, status: 'active' });
      setCurrentProfile(profile);
      
      // Navigate to the main app
      navigate('/void');
    } catch (error) {
      console.error('Failed to create profile:', error);
      setErrors({ displayName: 'Failed to create profile. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  }, [createProfile, setCurrentProfile, draft, navigate]);

  return (
    <section className="mx-auto max-w-xl px-6 py-8 font-mono">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="text-xs tracking-widest text-primary">RESONANCE ONBOARDING</div>
          <h1 className="mt-2 text-2xl font-semibold">{step}</h1>
        </div>
        <div className="text-xs text-muted-foreground">{stepIndex + 1}/{steps.length}</div>
      </div>

      <div className="space-y-4">
        {step === 'Identity' && (
          <>
            <label className="block space-y-2">
              <span className="text-xs tracking-widest text-muted-foreground">DISPLAY NAME</span>
              <input
                className="w-full border bg-transparent px-3 py-2 text-base outline-none focus:border-primary"
                value={draft.displayName}
                onChange={event => updateDraft({ displayName: event.target.value })}
                autoComplete="name"
              />
              {errors.displayName && <span className="text-xs text-destructive">{errors.displayName}</span>}
            </label>

            <label className="block space-y-2">
              <span className="text-xs tracking-widest text-muted-foreground">AGE</span>
              <input
                className="w-full border bg-transparent px-3 py-2 text-base outline-none focus:border-primary"
                type="number"
                min={18}
                max={120}
                value={draft.age}
                onChange={event => updateDraft({ age: numberFromInput(event.target.value) })}
              />
              {errors.age && <span className="text-xs text-destructive">{errors.age}</span>}
            </label>

            <label className="block space-y-2">
              <span className="text-xs tracking-widest text-muted-foreground">SEX</span>
              <select
                className="w-full border bg-transparent px-3 py-2 text-base outline-none focus:border-primary"
                value={draft.sex}
                onChange={event => updateDraft({ sex: event.target.value })}
              >
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="non_binary">Non-binary</option>
                <option value="other">Other</option>
              </select>
              {errors.sex && <span className="text-xs text-destructive">{errors.sex}</span>}
            </label>
          </>
        )}

        {step === 'Location' && (
          <label className="block space-y-2">
            <span className="text-xs tracking-widest text-muted-foreground">LOCATION</span>
            <input
              className="w-full border bg-transparent px-3 py-2 text-base outline-none focus:border-primary"
              value={draft.location}
              onChange={event => updateDraft({ location: event.target.value })}
              placeholder="City, State"
              autoComplete="address-level2"
            />
            {errors.location && <span className="text-xs text-destructive">{errors.location}</span>}
          </label>
        )}

        {step === 'Preferences' && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <label className="block space-y-2">
                <span className="text-xs tracking-widest text-muted-foreground">MIN AGE</span>
                <input
                  className="w-full border bg-transparent px-3 py-2 text-base outline-none focus:border-primary"
                  type="number"
                  min={18}
                  max={120}
                  value={draft.datingPreferences.minAge}
                  onChange={event => updatePreferences({ minAge: numberFromInput(event.target.value) })}
                />
                {errors.minAge && <span className="text-xs text-destructive">{errors.minAge}</span>}
              </label>
              <label className="block space-y-2">
                <span className="text-xs tracking-widest text-muted-foreground">MAX AGE</span>
                <input
                  className="w-full border bg-transparent px-3 py-2 text-base outline-none focus:border-primary"
                  type="number"
                  min={18}
                  max={120}
                  value={draft.datingPreferences.maxAge}
                  onChange={event => updatePreferences({ maxAge: numberFromInput(event.target.value) })}
                />
                {errors.maxAge && <span className="text-xs text-destructive">{errors.maxAge}</span>}
              </label>
            </div>

            <label className="block space-y-2">
              <span className="text-xs tracking-widest text-muted-foreground">GENDER PREFERENCE</span>
              <select
                className="w-full border bg-transparent px-3 py-2 text-base outline-none focus:border-primary"
                value={draft.datingPreferences.genderPreference}
                onChange={event => updatePreferences({ genderPreference: event.target.value })}
              >
                <option value="all">All</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="non_binary">Non-binary</option>
                <option value="other">Other</option>
              </select>
              {errors.genderPreference && <span className="text-xs text-destructive">{errors.genderPreference}</span>}
            </label>

            <label className="block space-y-2">
              <span className="text-xs tracking-widest text-muted-foreground">MATCH RADIUS (MILES)</span>
              <input
                className="w-full border bg-transparent px-3 py-2 text-base outline-none focus:border-primary"
                type="number"
                min={1}
                max={500}
                value={draft.datingPreferences.radiusMiles}
                onChange={event => updatePreferences({ radiusMiles: numberFromInput(event.target.value) })}
              />
              {errors.radiusMiles && <span className="text-xs text-destructive">{errors.radiusMiles}</span>}
            </label>
          </>
        )}
      </div>

      <div className="mt-8 flex gap-3">
        {stepIndex > 0 && (
          <button
            type="button"
            className="border px-4 py-2 text-xs tracking-widest text-muted-foreground hover:text-foreground"
            onClick={handleBack}
          >
            BACK
          </button>
        )}
        {stepIndex < steps.length - 1 ? (
          <button
            type="button"
            className="ml-auto border border-primary/40 px-4 py-2 text-xs tracking-widest text-primary disabled:opacity-40"
            onClick={handleNext}
            disabled={!canAdvance}
          >
            NEXT
          </button>
        ) : (
          <button
            type="button"
            className="ml-auto border border-primary/40 px-4 py-2 text-xs tracking-widest text-primary disabled:opacity-40"
            onClick={handleSubmit}
            disabled={!canAdvance || isSubmitting}
          >
            {isSubmitting ? 'CREATING...' : 'CREATE PROFILE'}
          </button>
        )}
      </div>
    </section>
  );
}