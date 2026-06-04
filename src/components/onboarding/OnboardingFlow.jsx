import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import useResonanceStore from '@/lib/resonanceStore';

const STEPS = ['Identity', 'Location', 'Preferences'];

function generateHandle() {
  const words = ['ECHO', 'NOVA', 'PULSE', 'WAVE', 'NODE', 'SYNC', 'FLUX', 'APEX', 'CORE', 'DRIFT'];
  const word = words[Math.floor(Math.random() * words.length)];
  const num = Math.floor(Math.random() * 900) + 100;
  return `${word}_${num}`;
}

export default function OnboardingFlow({ user, onComplete }) {
  const setCurrentProfile = useResonanceStore(s => s.setCurrentProfile);

  const [stepIndex, setStepIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [displayName, setDisplayName] = useState('');
  const [age, setAge] = useState('');
  const [sex, setSex] = useState('other');
  const [location, setLocation] = useState('');
  const [minAge, setMinAge] = useState(18);
  const [maxAge, setMaxAge] = useState(45);
  const [genderPref, setGenderPref] = useState('all');
  const [radius, setRadius] = useState(50);

  const step = STEPS[stepIndex];

  const canAdvance = () => {
    if (step === 'Identity') return displayName.trim().length >= 2 && age >= 18 && age <= 99;
    if (step === 'Location') return location.trim().length >= 2;
    return true;
  };

  const handleNext = () => {
    if (!canAdvance()) return;
    setStepIndex(i => i + 1);
  };

  const handleBack = () => setStepIndex(i => i - 1);

  const handleSubmit = async () => {
    setError('');
    setSaving(true);
    try {
      const profile = await base44.entities.UserProfile.create({
        user_id: user.id,
        handle: generateHandle(),
        age: parseInt(age, 10),
        sex,
        location: location.trim(),
        preference_min_age: minAge,
        preference_max_age: maxAge,
        preference_gender: genderPref,
        match_radius_miles: radius,
        tag_cloud: [],
      });

      setCurrentProfile(profile);
      onComplete(profile);
    } catch (err) {
      setError(err.message || 'Failed to create profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 font-mono">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8">
          <div className="text-xs tracking-widest text-primary mb-1">RESONANCE // ONBOARDING</div>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold tracking-tight">{step}</h1>
            <span className="text-xs text-muted-foreground">{stepIndex + 1} / {STEPS.length}</span>
          </div>
          {/* Progress bar */}
          <div className="mt-4 h-px bg-border w-full">
            <div
              className="h-px bg-primary transition-all duration-300"
              style={{ width: `${((stepIndex + 1) / STEPS.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Step content */}
        <div className="space-y-5">
          {step === 'Identity' && (
            <>
              <div className="space-y-1.5">
                <label className="text-xs tracking-widest text-muted-foreground">DISPLAY NAME</label>
                <input
                  className="w-full border border-border bg-transparent px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors"
                  placeholder="What should people call you?"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  autoFocus
                />
                <p className="text-xs text-muted-foreground/60">This will be your real name — shown once resonance unlocks it</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs tracking-widest text-muted-foreground">AGE</label>
                <input
                  className="w-full border border-border bg-transparent px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors"
                  type="number"
                  min={18}
                  max={99}
                  placeholder="18"
                  value={age}
                  onChange={e => setAge(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs tracking-widest text-muted-foreground">SEX</label>
                <select
                  className="w-full border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors"
                  value={sex}
                  onChange={e => setSex(e.target.value)}
                >
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="non_binary">Non-binary</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </>
          )}

          {step === 'Location' && (
            <div className="space-y-1.5">
              <label className="text-xs tracking-widest text-muted-foreground">LOCATION</label>
              <input
                className="w-full border border-border bg-transparent px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors"
                placeholder="City, State (e.g. Austin, TX)"
                value={location}
                onChange={e => setLocation(e.target.value)}
                autoFocus
              />
              <p className="text-xs text-muted-foreground/60">Used to show you nearby signals in the Void</p>
            </div>
          )}

          {step === 'Preferences' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs tracking-widest text-muted-foreground">MIN AGE</label>
                  <input
                    className="w-full border border-border bg-transparent px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors"
                    type="number" min={18} max={99}
                    value={minAge}
                    onChange={e => setMinAge(parseInt(e.target.value, 10) || 18)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs tracking-widest text-muted-foreground">MAX AGE</label>
                  <input
                    className="w-full border border-border bg-transparent px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors"
                    type="number" min={18} max={99}
                    value={maxAge}
                    onChange={e => setMaxAge(parseInt(e.target.value, 10) || 45)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs tracking-widest text-muted-foreground">INTERESTED IN</label>
                <select
                  className="w-full border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors"
                  value={genderPref}
                  onChange={e => setGenderPref(e.target.value)}
                >
                  <option value="all">Everyone</option>
                  <option value="female">Women</option>
                  <option value="male">Men</option>
                  <option value="non_binary">Non-binary</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs tracking-widest text-muted-foreground">MATCH RADIUS — {radius} miles</label>
                <input
                  className="w-full accent-primary"
                  type="range" min={5} max={500} step={5}
                  value={radius}
                  onChange={e => setRadius(parseInt(e.target.value, 10))}
                />
                <div className="flex justify-between text-xs text-muted-foreground/50">
                  <span>5 mi</span>
                  <span>500 mi</span>
                </div>
              </div>
            </>
          )}
        </div>

        {error && (
          <div className="mt-4 border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Navigation */}
        <div className="mt-8 flex items-center gap-3">
          {stepIndex > 0 && (
            <button
              type="button"
              onClick={handleBack}
              className="border border-border px-4 py-2.5 text-xs tracking-widest text-muted-foreground hover:text-foreground transition-colors"
            >
              BACK
            </button>
          )}

          {stepIndex < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={!canAdvance()}
              className="ml-auto border border-primary/40 bg-primary/5 px-6 py-2.5 text-xs tracking-widest text-primary hover:bg-primary/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              NEXT →
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving}
              className="ml-auto border border-primary/60 bg-primary/10 px-6 py-2.5 text-xs tracking-widest text-primary hover:bg-primary/20 transition-colors disabled:opacity-50"
            >
              {saving ? 'CREATING...' : 'ENTER THE VOID →'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}