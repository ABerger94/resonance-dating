import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import useResonanceStore from '@/lib/resonanceStore';
import { clampMatchRadiusMiles, resolveCoordinates, DEFAULT_MATCH_RADIUS_MILES } from '@/lib/location';
import { clampAge, normalizeGenderPreference, normalizePreferenceAges, normalizeSex } from '@/lib/profilePreferences';
import { LogOut, MapPin, Save, Settings as SettingsIcon, User } from 'lucide-react';

export default function UserSettings() {
  const { user, logout } = useAuth();
  const { currentUser, currentProfile, setCurrentProfile } = useResonanceStore();
  const activeUser = currentUser || user;
  const [profileId, setProfileId] = useState(null);
  const [form, setForm] = useState({
    handle: '',
    location: '',
    age: 18,
    sex: 'other',
    preference_min_age: 18,
    preference_max_age: 45,
    preference_gender: 'all',
    match_radius_miles: DEFAULT_MATCH_RADIUS_MILES
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSettings();
  }, [activeUser?.id]);

  const loadSettings = async () => {
    if (!activeUser) return;
    setLoading(true);
    setError('');
    try {
      const profiles = await base44.entities.UserProfile.filter({ user_id: activeUser.id });
      const profile = profiles[0];
      if (profile) {
        setProfileId(profile.id);
        setCurrentProfile(profile);
        const preferenceAges = normalizePreferenceAges(profile.preference_min_age, profile.preference_max_age);
        setForm({
          handle: profile.handle || '',
          location: profile.location || '',
          age: clampAge(profile.age),
          sex: normalizeSex(profile.sex),
          preference_min_age: preferenceAges.minAge,
          preference_max_age: preferenceAges.maxAge,
          preference_gender: normalizeGenderPreference(profile.preference_gender),
          match_radius_miles: clampMatchRadiusMiles(profile.match_radius_miles)
        });
      } else {
        setProfileId(null);
        setForm({
          handle: currentProfile?.handle || '',
          location: '',
          age: 18,
          sex: 'other',
          preference_min_age: 18,
          preference_max_age: 45,
          preference_gender: 'all',
          match_radius_miles: DEFAULT_MATCH_RADIUS_MILES
        });
      }
    } catch (err) {
      console.error(err);
      setError('Could not load settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!activeUser) return;
    if (!form.handle.trim()) {
      setError('Handle is required.');
      return;
    }
    setSaving(true);
    setSaved(false);
    setError('');
    const coordinates = resolveCoordinates(form.location);
    const preferenceAges = normalizePreferenceAges(form.preference_min_age, form.preference_max_age);
    const data = {
      user_id: activeUser.id,
      handle: form.handle.trim(),
      location: form.location.trim(),
      age: clampAge(form.age),
      sex: normalizeSex(form.sex),
      preference_min_age: preferenceAges.minAge,
      preference_max_age: preferenceAges.maxAge,
      preference_gender: normalizeGenderPreference(form.preference_gender),
      latitude: coordinates?.latitude,
      longitude: coordinates?.longitude,
      match_radius_miles: clampMatchRadiusMiles(form.match_radius_miles),
      tag_cloud: Array.isArray(currentProfile?.tag_cloud) ? currentProfile.tag_cloud : [],
      is_mock: false
    };

    try {
      const profile = profileId
        ? await base44.entities.UserProfile.update(profileId, data)
        : await base44.entities.UserProfile.create(data);
      setProfileId(profile.id);
      setCurrentProfile(profile);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error(err);
      setError('Could not save settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen font-mono" style={{ background: 'hsl(var(--background))' }}>
      <div className="border-b px-6 py-4" style={{ borderColor: 'hsl(var(--border))' }}>
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <SettingsIcon size={14} className="text-primary" />
            <span className="text-primary font-bold tracking-widest text-sm">SETTINGS</span>
          </div>
          <button
            onClick={() => logout(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 border text-xs tracking-widest transition-all hover:border-destructive/50 hover:text-destructive"
            style={{ borderColor: 'hsl(var(--border))' }}
          >
            <LogOut size={12} />
            LOG OUT
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-6 space-y-5">
        {loading ? (
          <div className="text-muted-foreground/40 text-xs tracking-widest animate-pulse py-8 text-center">
            LOADING SETTINGS...
          </div>
        ) : (
          <>
            <div className="border p-4 space-y-3" style={{ borderColor: 'hsl(var(--border))' }}>
              <div className="flex items-center gap-2 text-xs tracking-widest text-muted-foreground">
                <User size={12} />
                ACCOUNT
              </div>
              <div className="text-sm text-foreground/80">{activeUser?.email || activeUser?.full_name || 'Signed in'}</div>
              <Link
                to="/profile"
                className="inline-flex items-center text-xs tracking-widest text-primary hover:underline"
              >
                EDIT FULL PROFILE
              </Link>
            </div>

            <div className="border p-4 space-y-4" style={{ borderColor: 'hsl(var(--border))' }}>
              <div className="flex items-center gap-2 text-xs tracking-widest text-muted-foreground">
                <MapPin size={12} />
                MATCHMAKING
              </div>

              <label className="block space-y-2">
                <span className="text-xs tracking-widest text-muted-foreground">HANDLE</span>
                <input
                  type="text"
                  value={form.handle}
                  onChange={event => setForm(current => ({ ...current, handle: event.target.value }))}
                  className="w-full bg-transparent border px-3 py-2 text-base text-foreground placeholder:text-muted-foreground/20 outline-none focus:border-primary/30"
                  style={{ borderColor: 'hsl(var(--border))', fontFamily: "'JetBrains Mono', monospace" }}
                />
              </label>

              <label className="block space-y-2">
                <span className="text-xs tracking-widest text-muted-foreground">AREA</span>
                <input
                  type="text"
                  value={form.location}
                  onChange={event => setForm(current => ({ ...current, location: event.target.value }))}
                  placeholder="Brooklyn, NY or 40.6782,-73.9442"
                  className="w-full bg-transparent border px-3 py-2 text-base text-foreground placeholder:text-muted-foreground/20 outline-none focus:border-primary/30"
                  style={{ borderColor: 'hsl(var(--border))', fontFamily: "'JetBrains Mono', monospace" }}
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="block space-y-2">
                  <span className="text-xs tracking-widest text-muted-foreground">AGE</span>
                  <input
                    type="number"
                    min={18}
                    max={120}
                    value={form.age}
                    onChange={event => setForm(current => ({ ...current, age: event.target.valueAsNumber }))}
                    className="w-full bg-transparent border px-3 py-2 text-base text-foreground placeholder:text-muted-foreground/20 outline-none focus:border-primary/30"
                    style={{ borderColor: 'hsl(var(--border))', fontFamily: "'JetBrains Mono', monospace" }}
                  />
                </label>

                <label className="block space-y-2">
                  <span className="text-xs tracking-widest text-muted-foreground">SEX</span>
                  <select
                    value={form.sex}
                    onChange={event => setForm(current => ({ ...current, sex: event.target.value }))}
                    className="w-full bg-transparent border px-3 py-2 text-base text-foreground outline-none focus:border-primary/30"
                    style={{ borderColor: 'hsl(var(--border))', fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="non_binary">Non-binary</option>
                    <option value="other">Other</option>
                  </select>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="block space-y-2">
                  <span className="text-xs tracking-widest text-muted-foreground">MIN AGE</span>
                  <input
                    type="number"
                    min={18}
                    max={120}
                    value={form.preference_min_age}
                    onChange={event => setForm(current => ({ ...current, preference_min_age: event.target.valueAsNumber }))}
                    className="w-full bg-transparent border px-3 py-2 text-base text-foreground placeholder:text-muted-foreground/20 outline-none focus:border-primary/30"
                    style={{ borderColor: 'hsl(var(--border))', fontFamily: "'JetBrains Mono', monospace" }}
                  />
                </label>

                <label className="block space-y-2">
                  <span className="text-xs tracking-widest text-muted-foreground">MAX AGE</span>
                  <input
                    type="number"
                    min={18}
                    max={120}
                    value={form.preference_max_age}
                    onChange={event => setForm(current => ({ ...current, preference_max_age: event.target.valueAsNumber }))}
                    className="w-full bg-transparent border px-3 py-2 text-base text-foreground placeholder:text-muted-foreground/20 outline-none focus:border-primary/30"
                    style={{ borderColor: 'hsl(var(--border))', fontFamily: "'JetBrains Mono', monospace" }}
                  />
                </label>
              </div>

              <label className="block space-y-2">
                <span className="text-xs tracking-widest text-muted-foreground">GENDER PREFERENCE</span>
                <select
                  value={form.preference_gender}
                  onChange={event => setForm(current => ({ ...current, preference_gender: event.target.value }))}
                  className="w-full bg-transparent border px-3 py-2 text-base text-foreground outline-none focus:border-primary/30"
                  style={{ borderColor: 'hsl(var(--border))', fontFamily: "'JetBrains Mono', monospace" }}
                >
                  <option value="all">All</option>
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="non_binary">Non-binary</option>
                  <option value="other">Other</option>
                </select>
              </label>

              <label className="block space-y-2">
                <span className="text-xs tracking-widest text-muted-foreground">VOID RADIUS</span>
                <input
                  type="number"
                  min={1}
                  max={500}
                  value={form.match_radius_miles}
                  onChange={event => setForm(current => ({ ...current, match_radius_miles: event.target.valueAsNumber }))}
                  className="w-full bg-transparent border px-3 py-2 text-base text-foreground placeholder:text-muted-foreground/20 outline-none focus:border-primary/30"
                  style={{ borderColor: 'hsl(var(--border))', fontFamily: "'JetBrains Mono', monospace" }}
                />
                <div className="text-muted-foreground/40" style={{ fontSize: '10px' }}>
                  Shows Void threads from other users within {clampMatchRadiusMiles(form.match_radius_miles)} miles when their area can be resolved.
                </div>
              </label>

              {error && <div className="text-xs text-destructive">{error}</div>}

              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center justify-center gap-2 w-full py-2.5 text-xs tracking-widest font-bold transition-all border disabled:opacity-50"
                style={{
                  background: saved ? 'rgba(16,185,129,0.1)' : 'transparent',
                  borderColor: saved ? '#10B981' : 'rgba(16,185,129,0.3)',
                  color: '#10B981'
                }}
              >
                <Save size={12} />
                {saving ? 'SAVING...' : saved ? 'SETTINGS SAVED' : 'SAVE SETTINGS'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
