import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { MOCK_PROFILES, MOCK_THREADS } from '@/lib/mockSeeder';
import useResonanceStore from '@/lib/resonanceStore';
import { useAuth } from '@/lib/AuthContext';
import { canUseAdminTools } from '@/lib/security';
import {
  Check,
  Circle,
  CornerDownRight,
  DatabaseZap,
  Play,
  Settings as SettingsIcon,
  Square,
  Trash2
} from 'lucide-react';

export default function Settings() {
  const { user: authUser } = useAuth();
  const { currentUser, seederEnabled, setSeederEnabled, devMode, setDevMode } = useResonanceStore();
  const [seeding, setSeeding] = useState(false);
  const [purging, setPurging] = useState(false);
  const [log, setLog] = useState([]);

  const appendLog = (msg, type = 'info') => {
    setLog(prev => [...prev, { msg, type, ts: Date.now() }]);
  };

  if (!canUseAdminTools(currentUser || authUser)) {
    return (
      <div className="min-h-screen flex items-center justify-center font-mono text-xs tracking-widest text-muted-foreground">
        ACCESS DENIED
      </div>
    );
  }

  const handleToggleSeeder = async () => {
    const newVal = !seederEnabled;
    setSeederEnabled(newVal);
    appendLog(`Mock seeder ${newVal ? 'ENABLED' : 'DISABLED'}`, newVal ? 'success' : 'warn');
  };

  const upsertMockProfile = async (profile) => {
    const publicData = {
      user_id: profile.mock_id,
      handle: profile.handle,
      tag_cloud: profile.tag_cloud,
      location: profile.location,
      age: profile.age,
      sex: profile.sex,
      preference_min_age: profile.preference_min_age,
      preference_max_age: profile.preference_max_age,
      preference_gender: profile.preference_gender,
      latitude: profile.latitude,
      longitude: profile.longitude,
      match_radius_miles: profile.match_radius_miles,
      is_mock: true,
      mock_id: profile.mock_id
    };
    const existingProfiles = await base44.entities.UserProfile.filter({ mock_id: profile.mock_id });
    if (existingProfiles[0]) {
      await base44.entities.UserProfile.update(existingProfiles[0].id, publicData);
    } else {
      await base44.entities.UserProfile.create(publicData);
    }

    const privateData = {
      user_id: profile.mock_id,
      display_name: profile.display_name,
      bio: profile.bio,
      interests: profile.interests,
      photo_url: profile.photo_url,
      photo_urls: profile.photo_url ? [profile.photo_url] : []
    };
    const existingPrivateProfiles = await base44.entities.PrivateProfile.filter({ user_id: profile.mock_id });
    if (existingPrivateProfiles[0]) {
      await base44.entities.PrivateProfile.update(existingPrivateProfiles[0].id, privateData);
    } else {
      await base44.entities.PrivateProfile.create(privateData);
    }
  };

  const seedMockData = async ({ replaceThreads = false } = {}) => {
    for (const profile of MOCK_PROFILES) {
      try {
        await upsertMockProfile(profile);
        appendLog(`Seeded profile: ${profile.handle}`, 'success');
      } catch (error) {
        appendLog(`Profile ${profile.handle}: ${error.message}`, 'error');
      }
    }

    if (replaceThreads) {
      const existingThreads = await base44.entities.Thread.filter({ is_mock: true }, '-created_date', 500);
      for (const thread of existingThreads) {
        await base44.entities.Thread.delete(thread.id);
      }
      appendLog(`Replaced ${existingThreads.length} mock threads`, 'warn');
    }

    for (const thread of MOCK_THREADS) {
      try {
        const threadData = {
          creator_id: thread.creator_id,
          creator_handle: thread.creator_handle,
          prompt_id: thread.prompt_id,
          prompt_text: thread.prompt_text,
          topic_tags: thread.topic_tags,
          status: 'void',
          resonance_state: 'locked',
          resonance_score: 0,
          is_mock: true
        };
        const existingThreads = await base44.entities.Thread.filter({ id: thread.id });
        if (existingThreads[0]) {
          await base44.entities.Thread.update(existingThreads[0].id, threadData);
        } else {
          await base44.entities.Thread.create({ ...threadData, id: thread.id });
        }
        appendLog(`Seeded thread by ${thread.creator_handle}`, 'success');
      } catch (error) {
        appendLog(`Thread: ${error.message}`, 'error');
      }
    }
  };

  const handleSeedData = async () => {
    setSeeding(true);
    appendLog('Starting mock data seed...');
    try {
      await seedMockData();
      appendLog('Seed complete', 'success');
    } catch (error) {
      appendLog(`Seed failed: ${error.message}`, 'error');
    } finally {
      setSeeding(false);
    }
  };

  const handlePurgeMocks = async () => {
    setPurging(true);
    appendLog('Purging mock data...');
    try {
      const mockProfiles = await base44.entities.UserProfile.filter({ is_mock: true });
      for (const profile of mockProfiles) {
        if (profile.mock_id) {
          const privateProfiles = await base44.entities.PrivateProfile.filter({ user_id: profile.mock_id });
          for (const privateProfile of privateProfiles) {
            await base44.entities.PrivateProfile.delete(privateProfile.id);
          }
        }
        await base44.entities.UserProfile.delete(profile.id);
      }
      appendLog(`Deleted ${mockProfiles.length} mock profiles`, 'warn');

      const mockThreads = await base44.entities.Thread.filter({ is_mock: true });
      for (const thread of mockThreads) {
        await base44.entities.Thread.delete(thread.id);
      }
      appendLog(`Deleted ${mockThreads.length} mock threads`, 'warn');
      appendLog('Purge complete', 'success');
    } catch (error) {
      appendLog(`Purge failed: ${error.message}`, 'error');
    } finally {
      setPurging(false);
    }
  };

  const handleFreshStart = async () => {
    setPurging(true);
    appendLog('Starting fresh data reset...');
    try {
      const interactions = await base44.entities.Interaction.filter({}, '-created_date', 1000);
      for (const interaction of interactions) {
        await base44.entities.Interaction.delete(interaction.id);
      }
      appendLog(`Deleted ${interactions.length} interactions`, 'warn');

      const threads = await base44.entities.Thread.filter({}, '-created_date', 1000);
      for (const thread of threads) {
        await base44.entities.Thread.delete(thread.id);
      }
      appendLog(`Deleted ${threads.length} threads`, 'warn');

      const profiles = await base44.entities.UserProfile.filter({}, '-created_date', 1000);
      const realProfiles = profiles.filter(profile => !profile.is_mock);
      for (const profile of realProfiles) {
        await base44.entities.UserProfile.delete(profile.id);
      }
      appendLog(`Deleted ${realProfiles.length} real public profiles`, 'warn');

      const privateProfiles = await base44.entities.PrivateProfile.filter({}, '-created_date', 1000);
      const realPrivateProfiles = privateProfiles.filter(profile => !profile.user_id?.startsWith('mock_'));
      for (const profile of realPrivateProfiles) {
        await base44.entities.PrivateProfile.delete(profile.id);
      }
      appendLog(`Deleted ${realPrivateProfiles.length} real private profiles`, 'warn');

      await seedMockData({ replaceThreads: true });
      setSeederEnabled(true);
      appendLog('Fresh start complete. Remove provider auth accounts in Base44 auth/admin.', 'success');
    } catch (error) {
      appendLog(`Fresh start failed: ${error.message}`, 'error');
    } finally {
      setPurging(false);
    }
  };

  const logColors = { info: 'hsl(215 20% 52%)', success: '#10B981', warn: '#F59E0B', error: '#ef4444' };

  return (
    <div className="min-h-screen font-mono" style={{ background: 'hsl(var(--background))' }}>
      <div className="border-b px-6 py-4" style={{ borderColor: 'hsl(var(--border))' }}>
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <SettingsIcon size={14} className="text-primary" />
          <span className="text-primary font-bold tracking-widest text-sm">SYSTEM SETTINGS</span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-6 space-y-6">
        <div className="border p-4 space-y-4" style={{ borderColor: 'hsl(var(--border))' }}>
          <div className="flex items-center gap-2 text-xs tracking-widest">
            <Circle size={8} className="text-muted-foreground/60" />
            <span className="text-foreground/80">MOCK USER SEEDER</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-xs" style={{ color: seederEnabled ? '#10B981' : 'hsl(215 20% 52%)' }}>
                STATUS: {seederEnabled ? 'ENABLED' : 'DISABLED'}
              </div>
              <div className="text-muted-foreground/40" style={{ fontSize: '10px' }}>
                When enabled, mock threads from fictional users appear in the Void.
              </div>
            </div>
            <button
              onClick={handleToggleSeeder}
              className="px-4 py-2 border text-xs tracking-widest transition-all hover:opacity-80"
              style={{
                borderColor: seederEnabled ? '#10B981' : 'hsl(var(--border))',
                color: seederEnabled ? '#10B981' : 'hsl(215 20% 52%)',
                background: seederEnabled ? 'rgba(16,185,129,0.08)' : 'transparent'
              }}
            >
              {seederEnabled ? <><Square size={10} className="inline mr-1" />DISABLE</> : <><Play size={10} className="inline mr-1" />ENABLE</>}
            </button>
          </div>
        </div>

        <div className="border p-4 space-y-4" style={{ borderColor: 'hsl(var(--border))' }}>
          <div className="flex items-center gap-2 text-xs tracking-widest">
            <Circle size={8} className="text-muted-foreground/60" />
            <span className="text-foreground/80">DATABASE OPERATIONS</span>
          </div>
          <div className="text-muted-foreground/40" style={{ fontSize: '10px' }}>
            Persist mock data, purge mock records, or reset real app data while preserving seeded mocks.
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleSeedData}
              disabled={seeding || purging}
              className="flex-1 py-2 border text-xs tracking-widest transition-all hover:border-primary/50 hover:text-primary disabled:opacity-30"
              style={{ borderColor: 'hsl(var(--border))' }}
            >
              {seeding ? 'SEEDING...' : <><CornerDownRight size={10} className="inline mr-1" />SEED TO DB</>}
            </button>
            <button
              onClick={handlePurgeMocks}
              disabled={seeding || purging}
              className="flex items-center gap-1.5 px-4 py-2 border text-xs tracking-widest transition-all hover:border-destructive/50 hover:text-destructive disabled:opacity-30"
              style={{ borderColor: 'hsl(var(--border))' }}
            >
              <Trash2 size={10} />
              {purging ? 'PURGING...' : 'PURGE MOCKS'}
            </button>
          </div>
          <button
            onClick={handleFreshStart}
            disabled={seeding || purging}
            className="flex w-full items-center justify-center gap-1.5 py-2 border text-xs tracking-widest transition-all hover:border-destructive/50 hover:text-destructive disabled:opacity-30"
            style={{ borderColor: 'hsl(var(--border))' }}
          >
            <DatabaseZap size={11} />
            {purging ? 'RESETTING...' : 'FRESH START: DELETE REAL DATA AND RESEED MOCKS'}
          </button>
        </div>

        <div className="border p-4 space-y-4" style={{ borderColor: devMode ? 'rgba(245,158,11,0.2)' : 'hsl(var(--border))' }}>
          <div className="flex items-center gap-2 text-xs tracking-widest">
            <Circle size={8} className="text-muted-foreground/60" />
            <span className="text-foreground/80">DEV TOOLBAR</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-xs" style={{ color: devMode ? '#F59E0B' : 'hsl(215 20% 52%)' }}>
                STATUS: {devMode ? 'ACTIVE' : 'INACTIVE'}
              </div>
              <div className="text-muted-foreground/40" style={{ fontSize: '10px' }}>
                Shows a floating toolbar in Sandbox to override ResonanceScore and test profile reveals.
              </div>
            </div>
            <button
              onClick={() => setDevMode(!devMode)}
              className="px-4 py-2 border text-xs tracking-widest transition-all hover:opacity-80"
              style={{
                borderColor: devMode ? '#F59E0B' : 'hsl(var(--border))',
                color: devMode ? '#F59E0B' : 'hsl(215 20% 52%)',
                background: devMode ? 'rgba(245,158,11,0.06)' : 'transparent'
              }}
            >
              {devMode ? 'DEACTIVATE' : 'ACTIVATE'}
            </button>
          </div>
        </div>

        {log.length > 0 && (
          <div
            className="border p-3 space-y-1 max-h-40 overflow-y-auto"
            style={{ borderColor: 'hsl(var(--border))', background: 'hsl(var(--card))' }}
          >
            <div className="text-muted-foreground/40 mb-2 tracking-widest" style={{ fontSize: '9px' }}>
              OPERATION LOG
            </div>
            {log.map((entry, index) => (
              <div key={index} style={{ color: logColors[entry.type], fontSize: '10px', fontFamily: "'JetBrains Mono', monospace" }}>
                <span className="text-muted-foreground/30 mr-2">{new Date(entry.ts).toLocaleTimeString()}</span>
                {entry.type === 'success' && <Check size={10} className="inline mr-1" />}
                {entry.msg}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
