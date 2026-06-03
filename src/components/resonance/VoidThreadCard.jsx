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
      className="void-card border p-4 cursor-pointer transition-all duration-300 font-mono group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onJoin(thread)}
      style={{
        borderColor: hovered ? 'hsl(258 90% 70%)' : 'hsl(var(--border))',
        background: hovered ? 'hsl(258 90% 98%)' : 'hsl(var(--card))',
        boxShadow: hovered ? '0 4px 24px rgba(139,92,246,0.12)' : '0 1px 4px rgba(0,0,0,0.04)',
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
                  color: '#444455',
                  border: '1px solid #222233',
                  fontFamily: "'JetBrains Mono', monospace"
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Join CTA */}
        <div 
          className={`flex items-center justify-end gap-1 text-xs transition-opacity duration-200 ${hovered ? 'opacity-100' : 'opacity-0'}`}
          style={{ color: 'hsl(258 90% 60%)' }}
        >
          <span className="tracking-widest">ENTER THREAD</span>
          <ArrowRight size={12} />
        </div>
      </div>
    </div>
  );
}