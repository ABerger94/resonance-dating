import { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import useResonanceStore from '@/lib/resonanceStore';
import { User, RefreshCw, Upload, X } from 'lucide-react';

const ADJECTIVES = ['SIGNAL', 'VOID', 'ECHO', 'PHASE', 'NULL', 'STATIC', 'DEEP', 'CARRIER', 'QUANTA', 'FRINGE', 'CIPHER', 'FLUX'];
const NUMBERS = () => Math.floor(Math.random() * 90) + 10;

function generateHandle() {
  return `${ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)]}_${NUMBERS()}`;
}

export default function Profile() {
  const { currentUser, currentProfile, setCurrentProfile } = useResonanceStore();
  const [form, setForm] = useState({
    handle: '',
    display_name: '',
    bio: '',
    interests: '',
    photo_url: '',
    tag_cloud: ''
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [profileId, setProfileId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const photoInputRef = useRef(null);

  useEffect(() => {
    loadProfile();
  }, [currentUser]);

  const loadProfile = async () => {
    if (!currentUser) return;
    try {
      const profiles = await base44.entities.UserProfile.filter({ user_id: currentUser.id });
      if (profiles.length > 0) {
        const p = profiles[0];
        setProfileId(p.id);
        setCurrentProfile(p);
        setForm({
          handle: p.handle || '',
          display_name: p.display_name || '',
          bio: p.bio || '',
          interests: Array.isArray(p.interests) ? p.interests.join(', ') : (p.interests || ''),
          photo_url: p.photo_url || '',
          tag_cloud: Array.isArray(p.tag_cloud) ? p.tag_cloud.join(', ') : (p.tag_cloud || '')
        });
      } else {
        // Auto-generate handle
        setForm(f => ({ ...f, handle: generateHandle() }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSave = async () => {
    if (!currentUser) return;
    setSaving(true);
    const data = {
      user_id: currentUser.id,
      handle: form.handle,
      display_name: form.display_name,
      bio: form.bio,
      interests: form.interests.split(',').map(s => s.trim()).filter(Boolean),
      photo_url: form.photo_url,
      tag_cloud: form.tag_cloud.split(',').map(s => s.trim()).filter(Boolean),
      is_mock: false
    };
    try {
      let profile;
      if (profileId) {
        profile = await base44.entities.UserProfile.update(profileId, data);
      } else {
        profile = await base44.entities.UserProfile.create(data);
        setProfileId(profile.id);
      }
      setCurrentProfile(profile);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Basic content type check — no explicit images
    if (!file.type.startsWith('image/')) return;
    setUploading(true);
    try {
      const result = await base44.integrations.Core.UploadFile({ file });
      setForm(f => ({ ...f, photo_url: result.file_url }));
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const fields = [
    { key: 'handle', label: 'HANDLE', placeholder: 'SIGNAL_42', hint: 'Your public anonymous identifier. Always visible.', action: (
      <button 
        onClick={() => setForm(f => ({ ...f, handle: generateHandle() }))}
        className="text-muted-foreground/40 hover:text-primary transition-colors"
        title="Generate random handle"
      >
        <RefreshCw size={10} />
      </button>
    )},
    { key: 'display_name', label: 'REAL NAME', placeholder: 'Your actual name', hint: 'Unlocked to others at 25% resonance.', locked: true },
    { key: 'bio', label: 'BIO', placeholder: 'Tell the truth about yourself...', hint: 'Unlocked at 50% resonance.', locked: true, multiline: true },
    { key: 'interests', label: 'INTERESTS', placeholder: 'philosophy, jazz, mycology...', hint: 'Comma-separated. Unlocked at 75% resonance.', locked: true },
    { key: 'photo_url', label: 'PHOTO', hint: 'Upload a photo. Unlocked at 100% resonance — full resonance only.', locked: true, isPhoto: true },
    { key: 'tag_cloud', label: 'SIGNAL TAGS', placeholder: 'tech, philosophy, music...', hint: 'Always visible in the Void. Shows your intellectual signature.' }
  ];

  return (
    <div className="min-h-screen font-mono" style={{ background: 'hsl(var(--background))' }}>
      <div className="border-b px-6 py-4" style={{ borderColor: 'hsl(var(--border))' }}>
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <User size={14} className="text-primary" />
          <span className="text-primary font-bold tracking-widest text-sm">YOUR PROFILE</span>
          <span className="text-muted-foreground/50" style={{ fontSize: '10px' }}>
            // LOCKED FIELDS VISIBLE ONLY TO YOU
          </span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-6 space-y-5">
        {/* Lock legend */}
        <div 
          className="border p-3 text-xs space-y-1"
          style={{ borderColor: 'hsl(var(--border))', background: 'rgba(245,158,11,0.03)' }}
        >
          <div className="flex items-center gap-2 text-accent/70 tracking-widest" style={{ fontSize: '9px' }}>
            <span>⚠</span>
            <span>PROGRESSIVE UNLOCK SYSTEM ACTIVE</span>
          </div>
          <div className="text-muted-foreground/50" style={{ fontSize: '10px' }}>
            Locked fields are shown to others only when they reach the required resonance threshold in your shared thread.
          </div>
        </div>

        {fields.map(field => (
          <div key={field.key} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span 
                  className="tracking-widest" 
                  style={{ fontSize: '9px', color: field.locked ? '#F59E0B' : 'hsl(215 20% 52%)' }}
                >
                  {field.locked ? '🔒 ' : ''}{field.label}
                </span>
                {field.action}
              </div>
              <span className="text-muted-foreground/30" style={{ fontSize: '9px' }}>
                {field.hint}
              </span>
            </div>
            {field.isPhoto ? (
              <div className="space-y-2">
                {form.photo_url && (
                  <div className="relative inline-block">
                    <img
                      src={form.photo_url}
                      alt="Profile"
                      className="w-20 h-20 object-cover border"
                      style={{ borderColor: 'rgba(245,158,11,0.3)' }}
                    />
                    <button
                      onClick={() => setForm(f => ({ ...f, photo_url: '' }))}
                      className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center"
                      style={{ background: '#ef4444' }}
                    >
                      <X size={8} color="white" />
                    </button>
                  </div>
                )}
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={handlePhotoUpload}
                />
                <button
                  onClick={() => photoInputRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-2 px-3 py-2 border text-xs tracking-widest transition-all hover:border-amber-500/40 disabled:opacity-40"
                  style={{ borderColor: 'rgba(245,158,11,0.2)', color: '#F59E0B', fontFamily: "'JetBrains Mono', monospace" }}
                >
                  <Upload size={10} />
                  {uploading ? 'UPLOADING...' : form.photo_url ? 'REPLACE PHOTO' : 'UPLOAD PHOTO'}
                </button>
                <div className="text-muted-foreground/30" style={{ fontSize: '9px' }}>
                  JPG, PNG, WEBP or GIF · No explicit content
                </div>
              </div>
            ) : field.multiline ? (
              <textarea
                value={form[field.key]}
                onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                placeholder={field.placeholder}
                rows={4}
                className="w-full bg-transparent border px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/20 outline-none focus:border-primary/30 resize-none"
                style={{ 
                  borderColor: field.locked ? 'rgba(245,158,11,0.2)' : 'hsl(var(--border))',
                  fontFamily: "'JetBrains Mono', monospace"
                }}
              />
            ) : (
              <input
                type="text"
                value={form[field.key]}
                onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                placeholder={field.placeholder}
                className="w-full bg-transparent border px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/20 outline-none focus:border-primary/30"
                style={{ 
                  borderColor: field.locked ? 'rgba(245,158,11,0.2)' : 'hsl(var(--border))',
                  fontFamily: "'JetBrains Mono', monospace"
                }}
              />
            )}
          </div>
        ))}

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-2.5 text-xs tracking-widest font-bold transition-all border disabled:opacity-50"
          style={{
            background: saved ? 'rgba(16,185,129,0.1)' : 'transparent',
            borderColor: saved ? '#10B981' : 'rgba(16,185,129,0.3)',
            color: '#10B981'
          }}
        >
          {saving ? 'SAVING...' : saved ? '✓ PROFILE SAVED' : '↳ SAVE PROFILE'}
        </button>
      </div>
    </div>
  );
}