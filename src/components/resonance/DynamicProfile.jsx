import { useState, useEffect } from 'react';
import { getUnlockedFields } from '@/lib/resonanceEngine';
import GlitchText from './GlitchText';
import { Lock, User, FileText, Tag, ImageIcon } from 'lucide-react';

const REDACTED = '████████████████████';

function RedactedBlock({ label, icon: Icon }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5 text-muted-foreground/50" style={{ fontSize: '9px' }}>
        <Icon size={10} />
        <span className="tracking-widest">{label}</span>
        <Lock size={8} />
      </div>
      <div 
        className="text-muted-foreground/20 font-mono select-none"
        style={{ fontSize: '11px', letterSpacing: '1px' }}
      >
        {REDACTED}
      </div>
    </div>
  );
}

function UnlockedField({ label, icon: Icon, children, isNew, onAnimationDone }) {
  const [triggered, setTriggered] = useState(false);

  useEffect(() => {
    if (isNew) {
      const t = setTimeout(() => setTriggered(true), 100);
      return () => clearTimeout(t);
    }
  }, [isNew]);

  return (
    <div 
      className={`space-y-1 transition-all duration-500 ${isNew ? 'border border-primary/30 p-2 rounded' : ''}`}
      style={isNew ? { boxShadow: '0 0 8px rgba(14,165,233,0.15)' } : {}}
    >
      <div className="flex items-center gap-1.5 text-primary/70" style={{ fontSize: '9px' }}>
        <Icon size={10} />
        <span className="tracking-widest">{label}</span>
        {isNew && <span className="text-primary animate-pulse">● UNLOCKED</span>}
      </div>
      <div>{children}</div>
    </div>
  );
}

export default function DynamicProfile({ profile, score, threadId, previousScore = 0 }) {
  const unlocked = getUnlockedFields(score);
  const prevUnlocked = getUnlockedFields(previousScore);

  const isNewUnlock = (field) => unlocked[field] && !prevUnlocked[field];

  if (!profile) {
    return (
      <div className="space-y-4 p-4 font-mono">
        <div className="text-muted-foreground/50 text-xs tracking-widest">// NO SIGNAL</div>
        <div className="text-muted-foreground/20 text-sm">{REDACTED}</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 font-mono text-sm">
      {/* Handle — always visible */}
      <div className="space-y-1">
        <div className="flex items-center gap-1.5 text-muted-foreground/50" style={{ fontSize: '9px' }}>
          <User size={10} />
          <span className="tracking-widest">HANDLE</span>
          <span className="text-primary/50">PUBLIC</span>
        </div>
        <div className="text-foreground font-bold tracking-widest">{profile.handle}</div>
      </div>

      {/* Tag cloud — always visible */}
      {profile.tag_cloud && profile.tag_cloud.length > 0 && (
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-muted-foreground/50" style={{ fontSize: '9px' }}>
            <Tag size={10} />
            <span className="tracking-widest">SIGNAL TAGS</span>
            <span className="text-primary/50">PUBLIC</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {profile.tag_cloud.map(tag => (
              <span 
                key={tag}
                className="px-1.5 py-0.5 text-xs border"
                style={{ 
                  borderColor: 'hsl(var(--border))', 
                  color: 'hsl(215 20% 45%)',
                  fontSize: '10px'
                }}
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Separator */}
      <div className="border-t border-dashed" style={{ borderColor: 'hsl(var(--border))' }} />

      {/* NAME */}
      {unlocked.name ? (
        <UnlockedField 
          label="IDENTITY" 
          icon={User} 
          isNew={isNewUnlock('name')}
        >
          <GlitchText
            text={profile.display_name}
            trigger={isNewUnlock('name')}
            className="text-foreground font-bold text-base"
          />
        </UnlockedField>
      ) : (
        <RedactedBlock label="IDENTITY [25%]" icon={User} />
      )}

      {/* BIO */}
      {unlocked.bio ? (
        <UnlockedField 
          label="BIO" 
          icon={FileText}
          isNew={isNewUnlock('bio')}
        >
          <GlitchText
            text={profile.bio}
            trigger={isNewUnlock('bio')}
            className="text-foreground/80 text-xs leading-relaxed"
          />
        </UnlockedField>
      ) : (
        <RedactedBlock label="BIO [50%]" icon={FileText} />
      )}

      {/* INTERESTS */}
      {unlocked.interests ? (
        <UnlockedField 
          label="INTERESTS" 
          icon={Tag}
          isNew={isNewUnlock('interests')}
        >
          <div className="flex flex-wrap gap-1 mt-1">
            {profile.interests?.map((interest, i) => (
              <span 
                key={interest}
                className="px-1.5 py-0.5 text-xs border border-primary/30"
                style={{ 
                  color: '#10B981', 
                  fontSize: '10px',
                  opacity: isNewUnlock('interests') ? 1 : 1,
                  animationDelay: `${i * 100}ms`
                }}
              >
                {interest}
              </span>
            ))}
          </div>
        </UnlockedField>
      ) : (
        <RedactedBlock label="INTERESTS [75%]" icon={Tag} />
      )}

      {/* PHOTO */}
      {unlocked.photo ? (
        <UnlockedField 
          label="VISUAL" 
          icon={ImageIcon}
          isNew={isNewUnlock('photo')}
        >
          <div 
            className="mt-1 overflow-hidden"
            style={{ 
              border: isNewUnlock('photo') ? '1px solid #0EA5E9' : '1px solid hsl(var(--border))',
              boxShadow: isNewUnlock('photo') ? '0 0 20px rgba(14,165,233,0.3)' : 'none'
            }}
          >
            <img 
              src={profile.photo_url} 
              alt={profile.display_name}
              className="w-full h-32 object-cover"
              style={{ filter: 'grayscale(20%) contrast(1.05)' }}
            />
          </div>
        </UnlockedField>
      ) : (
        <RedactedBlock label="VISUAL [100%]" icon={ImageIcon} />
      )}
    </div>
  );
}