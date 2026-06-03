import { formatDistanceToNow } from 'date-fns';
import { renderSegmentedBar, getResonanceState, getStateColor } from '@/lib/resonanceEngine';
import { Radio, Lock, Zap, MessageSquare } from 'lucide-react';

const STATE_ICONS = {
  locked: Lock,
  discovering: Radio,
  resonating: Zap
};

export default function ThreadCard({ thread, onClick, isActive = false }) {
  const state = thread.resonance_state || 'locked';
  const score = thread.resonance_score || 0;
  const StateIcon = STATE_ICONS[state];
  const bar = renderSegmentedBar(score, 10);
  const filled = bar.split('').filter(c => c === '█').length;
  const empty = 10 - filled;

  const stateColors = {
    locked: '#555566',
    discovering: '#FFB300',
    resonating: '#00FF88'
  };

  const lastActivity = thread.last_activity || thread.updated_date || thread.created_date;

  return (
    <div
      onClick={onClick}
      className="cursor-pointer border p-3 transition-all duration-200 group"
      style={{
        borderColor: isActive ? 'hsl(var(--primary) / 0.5)' : 'hsl(var(--border))',
        background: isActive ? 'hsl(var(--primary) / 0.04)' : 'transparent',
        boxShadow: isActive ? '0 0 12px rgba(0,255,136,0.08)' : 'none'
      }}
    >
      <div className="font-mono space-y-2">
        {/* Header row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <StateIcon size={10} style={{ color: stateColors[state] }} />
            <span className="text-xs font-bold tracking-widest">
              {thread.joiner_id ? 
                (thread.creator_handle || 'UNKNOWN') : 
                (thread.creator_handle || 'UNKNOWN')
              }
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <MessageSquare size={9} className="text-muted-foreground/40" />
            <span 
              className="text-xs tracking-widest font-bold"
              style={{ color: stateColors[state], fontSize: '10px' }}
            >
              {String(score).padStart(3, '0')}%
            </span>
          </div>
        </div>

        {/* Score bar */}
        <div className="flex items-center gap-1" style={{ fontSize: '11px', letterSpacing: '1px' }}>
          <span style={{ color: stateColors[state] }}>{'█'.repeat(filled)}</span>
          <span className="text-muted-foreground/20">{'░'.repeat(empty)}</span>
          <span 
            className="ml-1 tracking-widest text-muted-foreground/60"
            style={{ fontSize: '9px' }}
          >
            {state.toUpperCase()}
          </span>
        </div>

        {/* Last activity */}
        {lastActivity && (
          <div className="text-muted-foreground/40" style={{ fontSize: '9px' }}>
            {formatDistanceToNow(new Date(lastActivity), { addSuffix: true }).toUpperCase()}
          </div>
        )}
      </div>
    </div>
  );
}