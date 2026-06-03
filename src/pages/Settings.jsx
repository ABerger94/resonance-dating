import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { MOCK_PROFILES, MOCK_THREADS } from '@/lib/mockSeeder';
import useResonanceStore from '@/lib/resonanceStore';
import { useAuth } from '@/lib/AuthContext';
import { canUseAdminTools } from '@/lib/security';
import { Settings as SettingsIcon, Trash2, Play, Square } from 'lucide-react';

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

  const handleSeedData = async () => {
    setSeeding(true);
    appendLog('Starting mock data seed...');
    try {
      // Seed UserProfiles
      for (const p of MOCK_PROFILES) {
        try {
          await base44.entities.UserProfile.create({
            user_id: p.mock_id,
            handle: p.handle,
            tag_cloud: p.tag_cloud,
            is_mock: true,
            mock_id: p.mock_id
          });
          await base44.entities.PrivateProfile.create({
            user_id: p.mock_id,
            display_name: p.display_name,
            bio: p.bio,
            interests: p.interests,
            photo_url: p.photo_url,
            photo_urls: p.photo_url ? [p.photo_url] : []
          });
          appendLog(`Seeded profile: ${p.handle}`, 'success');
        } catch (e) {
          appendLog(`Profile ${p.handle}: ${e.message}`, 'error');
        }
      }

      // Seed Void threads
      for (const t of MOCK_THREADS) {
        try {
          await base44.entities.Thread.create({
            creator_id: t.creator_id,
            creator_handle: t.creator_handle,
            prompt_id: t.prompt_id,
            prompt_text: t.prompt_text,
            topic_tags: t.topic_tags,
            status: 'void',
            resonance_state: 'locked',
            resonance_score: 0,
            is_mock: true
          });
          appendLog(`Seeded thread by ${t.creator_handle}`, 'success');
        } catch (e) {
          appendLog(`Thread: ${e.message}`, 'error');
        }
      }

      appendLog('✓ Seed complete', 'success');
    } catch (e) {
      appendLog(`Seed failed: ${e.message}`, 'error');
    } finally {
      setSeeding(false);
    }
  };

  const handlePurgeMocks = async () => {
    setPurging(true);
    appendLog('Purging mock data...');
    try {
      const mockProfiles = await base44.entities.UserProfile.filter({ is_mock: true });
      for (const p of mockProfiles) {
        if (p.mock_id) {
          const privateProfiles = await base44.entities.PrivateProfile.filter({ user_id: p.mock_id });
          for (const privateProfile of privateProfiles) {
            await base44.entities.PrivateProfile.delete(privateProfile.id);
          }
        }
        await base44.entities.UserProfile.delete(p.id);
      }
      appendLog(`Deleted ${mockProfiles.length} mock profiles`, 'warn');

      const mockThreads = await base44.entities.Thread.filter({ is_mock: true });
      for (const t of mockThreads) {
        await base44.entities.Thread.delete(t.id);
      }
      appendLog(`Deleted ${mockThreads.length} mock threads`, 'warn');

      appendLog('✓ Purge complete', 'success');
    } catch (e) {
      appendLog(`Purge failed: ${e.message}`, 'error');
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
        {/* Seeder toggle */}
        <div className="border p-4 space-y-4" style={{ borderColor: 'hsl(var(--border))' }}>
          <div className="flex items-center gap-2 text-xs tracking-widest">
            <span className="text-muted-foreground/60">◈</span>
            <span className="text-foreground/80">MOCK USER SEEDER</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-xs" style={{ color: seederEnabled ? '#10B981' : 'hsl(215 20% 52%)' }}>
                STATUS: {seederEnabled ? 'ENABLED' : 'DISABLED'}
              </div>
              <div className="text-muted-foreground/40" style={{ fontSize: '10px' }}>
                When enabled, mock threads from 8-10 fictional users appear in the Void.
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

        {/* DB seed/purge */}
        <div className="border p-4 space-y-4" style={{ borderColor: 'hsl(var(--border))' }}>
          <div className="flex items-center gap-2 text-xs tracking-widest">
            <span className="text-muted-foreground/60">◈</span>
            <span className="text-foreground/80">DATABASE OPERATIONS</span>
          </div>
          <div className="text-muted-foreground/40" style={{ fontSize: '10px' }}>
            Persist mock data to the database so all sessions see them, or purge all mock records.
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleSeedData}
              disabled={seeding || purging}
              className="flex-1 py-2 border text-xs tracking-widest transition-all hover:border-primary/50 hover:text-primary disabled:opacity-30"
              style={{ borderColor: 'hsl(var(--border))' }}
            >
              {seeding ? 'SEEDING...' : '↳ SEED TO DB'}
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
        </div>

        {/* Dev mode toggle */}
        <div className="border p-4 space-y-4" style={{ borderColor: devMode ? 'rgba(245,158,11,0.2)' : 'hsl(var(--border))' }}>
          <div className="flex items-center gap-2 text-xs tracking-widest">
            <span className="text-muted-foreground/60">◈</span>
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

        {/* Operation log */}
        {log.length > 0 && (
          <div 
            className="border p-3 space-y-1 max-h-40 overflow-y-auto"
            style={{ borderColor: 'hsl(var(--border))', background: 'hsl(var(--card))' }}
          >
            <div className="text-muted-foreground/40 mb-2 tracking-widest" style={{ fontSize: '9px' }}>
              OPERATION LOG
            </div>
            {log.map((entry, i) => (
              <div key={i} style={{ color: logColors[entry.type], fontSize: '10px', fontFamily: "'JetBrains Mono', monospace" }}>
                <span className="text-muted-foreground/30 mr-2">{new Date(entry.ts).toLocaleTimeString()}</span>
                {entry.msg}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
