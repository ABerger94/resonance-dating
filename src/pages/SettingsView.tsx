import { useCallback, useEffect, useState } from 'react';
import type { GenderPreference, ProfileValidationErrors, Sex, UserProfileDraft } from '@/types/UserProfile';
import { useUserStore, validateUserProfileDraft } from '@/stores/useUserStore';

function numberFromInput(value: string): number {
  return Number.parseInt(value, 10);
}

export default function SettingsView() {
  const profile = useUserStore(state => state.profile);
  const updateProfile = useUserStore(state => state.updateProfile);
  const deleteProfile = useUserStore(state => state.deleteProfile);
  const [draft, setDraft] = useState<UserProfileDraft | null>(profile);
  const [errors, setErrors] = useState<ProfileValidationErrors>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setDraft(profile);
  }, [profile]);

  const updateDraft = useCallback((updates: Partial<UserProfileDraft>) => {
    setDraft(current => current ? { ...current, ...updates } : current);
    setSaved(false);
    setErrors({});
  }, []);

  const handleSave = useCallback(() => {
    if (!draft) return;
    const nextErrors = validateUserProfileDraft(draft);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    updateProfile({
      displayName: draft.displayName,
      age: draft.age,
      sex: draft.sex,
      location: draft.location,
      datingPreferences: draft.datingPreferences,
      status: draft.status ?? 'active',
    });
    setSaved(true);
  }, [draft, updateProfile]);

  if (!draft) {
    return (
      <section className="mx-auto max-w-xl px-6 py-8 font-mono">
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="mt-3 text-sm text-muted-foreground">Create a profile before editing settings.</p>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-xl px-6 py-8 font-mono">
      <div className="mb-6">
        <div className="text-xs tracking-widest text-primary">PROFILE SETTINGS</div>
        <h1 className="mt-2 text-2xl font-semibold">Settings</h1>
      </div>

      <div className="space-y-4">
        <label className="block space-y-2">
          <span className="text-xs tracking-widest text-muted-foreground">DISPLAY NAME</span>
          <input
            className="w-full border bg-transparent px-3 py-2 text-base outline-none focus:border-primary"
            value={draft.displayName}
            onChange={event => updateDraft({ displayName: event.target.value })}
          />
          {errors.displayName && <span className="text-xs text-destructive">{errors.displayName}</span>}
        </label>

        <div className="grid grid-cols-2 gap-3">
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
              onChange={event => updateDraft({ sex: event.target.value as Sex })}
            >
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="non_binary">Non-binary</option>
              <option value="other">Other</option>
            </select>
            {errors.sex && <span className="text-xs text-destructive">{errors.sex}</span>}
          </label>
        </div>

        <label className="block space-y-2">
          <span className="text-xs tracking-widest text-muted-foreground">LOCATION</span>
          <input
            className="w-full border bg-transparent px-3 py-2 text-base outline-none focus:border-primary"
            value={draft.location}
            onChange={event => updateDraft({ location: event.target.value })}
          />
          {errors.location && <span className="text-xs text-destructive">{errors.location}</span>}
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block space-y-2">
            <span className="text-xs tracking-widest text-muted-foreground">MIN AGE</span>
            <input
              className="w-full border bg-transparent px-3 py-2 text-base outline-none focus:border-primary"
              type="number"
              min={18}
              max={120}
              value={draft.datingPreferences.minAge}
              onChange={event => updateDraft({
                datingPreferences: {
                  ...draft.datingPreferences,
                  minAge: numberFromInput(event.target.value),
                },
              })}
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
              onChange={event => updateDraft({
                datingPreferences: {
                  ...draft.datingPreferences,
                  maxAge: numberFromInput(event.target.value),
                },
              })}
            />
            {errors.maxAge && <span className="text-xs text-destructive">{errors.maxAge}</span>}
          </label>
        </div>

        <label className="block space-y-2">
          <span className="text-xs tracking-widest text-muted-foreground">GENDER PREFERENCE</span>
          <select
            className="w-full border bg-transparent px-3 py-2 text-base outline-none focus:border-primary"
            value={draft.datingPreferences.genderPreference}
            onChange={event => updateDraft({
              datingPreferences: {
                ...draft.datingPreferences,
                genderPreference: event.target.value as GenderPreference,
              },
            })}
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
            onChange={event => updateDraft({
              datingPreferences: {
                ...draft.datingPreferences,
                radiusMiles: numberFromInput(event.target.value),
              },
            })}
          />
          {errors.radiusMiles && <span className="text-xs text-destructive">{errors.radiusMiles}</span>}
        </label>
      </div>

      <div className="mt-8 flex items-center gap-3">
        <button
          type="button"
          className="border border-primary/40 px-4 py-2 text-xs tracking-widest text-primary"
          onClick={handleSave}
        >
          SAVE CHANGES
        </button>
        <button
          type="button"
          className="border px-4 py-2 text-xs tracking-widest text-muted-foreground hover:text-destructive"
          onClick={deleteProfile}
        >
          DELETE PROFILE
        </button>
        {saved && <span className="text-xs text-primary">Saved</span>}
      </div>
    </section>
  );
}
