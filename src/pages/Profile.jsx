import { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import useResonanceStore from '@/lib/resonanceStore';
import { clampMatchRadiusMiles, resolveCoordinates, DEFAULT_MATCH_RADIUS_MILES } from '@/lib/location';
import { User, RefreshCw, Upload, X } from 'lucide-react';

const MAX_PROFILE_PHOTOS = 6;
const MAX_PROFILE_IMAGE_BYTES = 5 * 1024 * 1024;
const ADJECTIVES = ['SIGNAL', 'VOID', 'ECHO', 'PHASE', 'NULL', 'STATIC', 'DEEP', 'CARRIER', 'QUANTA', 'FRINGE', 'CIPHER', 'FLUX'];
const NUMBERS = () => Math.floor(Math.random() * 90) + 10;

function generateHandle() {
  return `${ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)]}_${NUMBERS()}`;
}

function normalizePhotoUrls(profile) {
  const urls = Array.isArray(profile?.photo_urls) ? profile.photo_urls : [];
  if (profile?.photo_url) urls.unshift(profile.photo_url);
  return Array.from(new Set(urls.filter(Boolean))).slice(0, MAX_PROFILE_PHOTOS);
}

export default function Profile() {
  const { currentUser, currentProfile, setCurrentProfile } = useResonanceStore();
  const [form, setForm] = useState({
    handle: '',
    display_name: '',
    bio: '',
    interests: '',
    photo_url: '',
    photo_urls: [],
    location: '',
    match_radius_miles: DEFAULT_MATCH_RADIUS_MILES,
    tag_cloud: ''
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [profileId, setProfileId] = useState(null);
  const [privateProfileId, setPrivateProfileId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const photoInputRef = useRef(null);

  useEffect(() => {
    loadProfile();
  }, [currentUser]);

  const loadProfile = async () => {
    if (!currentUser) return;
    try {
      const profiles = await base44.entities.UserProfile.filter({ user_id: currentUser.id });
      const privateProfiles = await base44.entities.PrivateProfile.filter({ user_id: currentUser.id });
      const privateProfile = privateProfiles[0];
      if (privateProfile) setPrivateProfileId(privateProfile.id);

      if (profiles.length > 0) {
        const p = profiles[0];
        setProfileId(p.id);
        setCurrentProfile(p);
        const photoUrls = normalizePhotoUrls(privateProfile || p);
        setForm({
          handle: p.handle || '',
          display_name: privateProfile?.display_name || p.display_name || '',
          bio: privateProfile?.bio || p.bio || '',
          interests: Array.isArray(privateProfile?.interests) ? privateProfile.interests.join(', ') : (Array.isArray(p.interests) ? p.interests.join(', ') : ''),
          photo_url: photoUrls[0] || '',
          photo_urls: photoUrls,
          location: p.location || '',
          match_radius_miles: clampMatchRadiusMiles(p.match_radius_miles),
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
    const coordinates = resolveCoordinates(form.location);
    const publicData = {
      user_id: currentUser.id,
      handle: form.handle,
      tag_cloud: form.tag_cloud.split(',').map(s => s.trim()).filter(Boolean),
      location: form.location.trim(),
      latitude: coordinates?.latitude,
      longitude: coordinates?.longitude,
      match_radius_miles: clampMatchRadiusMiles(form.match_radius_miles),
      is_mock: false
    };
    const privateData = {
      user_id: currentUser.id,
      display_name: form.display_name,
      bio: form.bio,
      interests: form.interests.split(',').map(s => s.trim()).filter(Boolean),
      photo_url: form.photo_urls[0] || '',
      photo_urls: form.photo_urls.slice(0, MAX_PROFILE_PHOTOS)
    };
    try {
      let profile;
      if (profileId) {
        profile = await base44.entities.UserProfile.update(profileId, publicData);
      } else {
        profile = await base44.entities.UserProfile.create(publicData);
        setProfileId(profile.id);
      }
      if (privateProfileId) {
        await base44.entities.PrivateProfile.update(privateProfileId, privateData);
      } else {
        const privateProfile = await base44.entities.PrivateProfile.create(privateData);
        setPrivateProfileId(privateProfile.id);
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
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const remainingSlots = MAX_PROFILE_PHOTOS - form.photo_urls.length;
    if (remainingSlots <= 0) return;
    const validFiles = files
      .filter(file => file.type.startsWith('image/') && file.size <= MAX_PROFILE_IMAGE_BYTES)
      .slice(0, remainingSlots);
    if (validFiles.length === 0) return;
    setUploading(true);
    try {
      const uploadedUrls = [];
      for (const file of validFiles) {
        const result = await base44.integrations.Core.UploadFile({ file });
        if (result?.file_url) uploadedUrls.push(result.file_url);
      }
      setForm(f => {
        const photoUrls = [...f.photo_urls, ...uploadedUrls].slice(0, MAX_PROFILE_PHOTOS);
        return { ...f, photo_url: photoUrls[0] || '', photo_urls: photoUrls };
      });
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const removePhoto = (index) => {
    setForm(f => {
      const photoUrls = f.photo_urls.filter((_, i) => i !== index);
      return { ...f, photo_url: photoUrls[0] || '', photo_urls: photoUrls };
    });
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
    { key: 'location', label: 'AREA', placeholder: 'Brooklyn, NY or 40.6782,-73.9442', hint: 'Used to show local Void threads within your radius.' },
    { key: 'match_radius_miles', label: 'MATCH RADIUS', placeholder: '50', hint: 'Maximum distance for Void threads and matches.', type: 'number' },
    { key: 'interests', label: 'INTERESTS', placeholder: 'philosophy, jazz, mycology...', hint: 'Comma-separated. Unlocked at 50% resonance.', locked: true },
    { key: 'bio', label: 'BIO', placeholder: 'Tell the truth about yourself...', hint: 'Unlocked at 75% resonance.', locked: true, multiline: true },
    { key: 'photo_urls', label: 'PHOTOS', hint: 'Upload up to 6 photos. Unlocked at 100% resonance - full resonance only.', locked: true, isPhoto: true },
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
                {form.photo_urls.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                    {form.photo_urls.map((photoUrl, index) => (
                      <div key={photoUrl} className="relative">
                        <img
                          src={photoUrl}
                          alt={`Profile ${index + 1}`}
                          className="aspect-square w-full object-cover border"
                          style={{ borderColor: index === 0 ? 'rgba(14,165,233,0.5)' : 'rgba(245,158,11,0.3)' }}
                        />
                        {index === 0 && (
                          <span
                            className="absolute bottom-1 left-1 px-1 py-0.5 tracking-widest"
                            style={{ background: 'rgba(14,165,233,0.85)', color: 'white', fontSize: '8px' }}
                          >
                            MAIN
                          </span>
                        )}
                        <button
                          onClick={() => removePhoto(index)}
                          className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center"
                          style={{ background: '#ef4444' }}
                          title="Remove photo"
                        >
                          <X size={8} color="white" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  multiple
                  className="hidden"
                  onChange={handlePhotoUpload}
                />
                <button
                  onClick={() => photoInputRef.current?.click()}
                  disabled={uploading || form.photo_urls.length >= MAX_PROFILE_PHOTOS}
                  className="flex items-center gap-2 px-3 py-2 border text-xs tracking-widest transition-all hover:border-amber-500/40 disabled:opacity-40"
                  style={{ borderColor: 'rgba(245,158,11,0.2)', color: '#F59E0B', fontFamily: "'JetBrains Mono', monospace" }}
                >
                  <Upload size={10} />
                  {uploading ? 'UPLOADING...' : form.photo_urls.length >= MAX_PROFILE_PHOTOS ? 'PHOTO LIMIT REACHED' : 'UPLOAD PHOTOS'}
                </button>
                <div className="text-muted-foreground/30" style={{ fontSize: '9px' }}>
                  {form.photo_urls.length}/{MAX_PROFILE_PHOTOS} PHOTOS - JPG, PNG, WEBP or GIF - No explicit content
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
                type={field.type || 'text'}
                value={form[field.key]}
                onChange={e => setForm(f => ({ ...f, [field.key]: field.type === 'number' ? e.target.valueAsNumber : e.target.value }))}
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
