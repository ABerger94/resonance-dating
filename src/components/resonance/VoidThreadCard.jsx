import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ArrowRight, Tag, Terminal } from 'lucide-react';

export default function VoidThreadCard({ thread, onJoin, style = {} }) {
  const [hovered, setHovered] = useState(false);

  const timeSince = thread.created_date 
    ? formatDistanceToNow(new Date(thread.created_date), { addSuffix: true }).toUpperCase()
    : 'RECENTLY';

  return (
    <div
      className="void-card border p-4 cursor-pointer transition-all duration-300 font-mono group active:scale-[0.98]"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onJoin(thread)}
      style={{
        borderColor: hovered ? 'rgba(14,165,233,0.5)' : 'hsl(var(--border))',
        background: hovered ? 'rgba(14,165,233,0.03)' : 'hsl(var(--card))',
        boxShadow: hovered ? '0 4px 24px rgba(14,165,233,0.1)' : '0 1px 4px rgba(0,0,0,0.04)',
        ...style
      }}
    >
      <div className="space-y-3">
        {/* Terminal header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal size={10} className="text-primary/60" />
            <span className="text-primary/60 text-xs tracking-widest">
              {thread.creator_handle || 'UNKNOWN'}
            </span>
          </div>
          <span className="text-muted-foreground/40" style={{ fontSize: '9px' }}>
            {timeSince}
          </span>
        </div>

        {/* Prompt text */}
        <div 
          className="text-foreground/90 text-sm leading-relaxed"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          <span className="text-primary/50 mr-1">&gt;</span>
          {thread.prompt_text}
        </div>

        {/* Tags */}
        {thread.topic_tags && thread.topic_tags.length > 0 && (
          <div className="flex flex-wrap gap-1 items-center">
            <Tag size={9} className="text-muted-foreground/40" />
            {thread.topic_tags.map(tag => (
              <span 
                key={tag}
                className="px-1.5 py-0.5"
                style={{ 
                  fontSize: '9px',
                  color: 'hsl(215 20% 45%)',
                  border: '1px solid hsl(var(--border))',
                  fontFamily: "'JetBrains Mono', monospace"
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Join CTA is always visible on mobile, hover-only on desktop */}
        <div 
          className={`flex items-center justify-end gap-1 text-xs transition-opacity duration-200 opacity-100 sm:opacity-0 ${hovered ? 'sm:opacity-100' : ''}`}
          style={{ color: '#0EA5E9' }}
        >
          <span className="tracking-widest">ENTER THREAD</span>
          <ArrowRight size={12} />
        </div>
      </div>
    </div>
  );
}
