import { formatDistanceToNow } from 'date-fns';
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
  const filled = Math.round((score / 100) * 10);
  const empty = 10 - filled;

  const stateColors = {
    locked: 'hsl(215 20% 55%)',
    discovering: '#10B981',
    resonating: '#0EA5E9'
  };

  const lastActivity = thread.last_activity || thread.updated_date || thread.created_date;

  return (
    <div
      onClick={onClick}
      className="cursor-pointer border p-3 transition-all duration-200 group"
      style={{
        borderColor: isActive ? 'hsl(var(--primary) / 0.5)' : 'hsl(var(--border))',
        background: isActive ? 'hsl(var(--primary) / 0.04)' : 'transparent',
        boxShadow: isActive ? '0 0 12px rgba(14,165,233,0.08)' : 'none'
      }}
    >
      <div className="font-mono space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <StateIcon size={10} style={{ color: stateColors[state] }} />
            <span className="text-xs font-bold tracking-widest">
              {thread.creator_handle || 'UNKNOWN'}
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

        <div className="flex items-center gap-1">
          <div className="flex gap-px" aria-label={`${score} percent resonance`}>
            {Array.from({ length: filled }).map((_, index) => (
              <span key={`filled-${index}`} className="h-2 w-2" style={{ background: stateColors[state] }} />
            ))}
            {Array.from({ length: empty }).map((_, index) => (
              <span key={`empty-${index}`} className="h-2 w-2 bg-muted-foreground/20" />
            ))}
          </div>
          <span
            className="ml-1 tracking-widest text-muted-foreground/60"
            style={{ fontSize: '9px' }}
          >
            {state.toUpperCase()}
          </span>
        </div>

        {lastActivity && (
          <div className="text-muted-foreground/40" style={{ fontSize: '9px' }}>
            {formatDistanceToNow(new Date(lastActivity), { addSuffix: true }).toUpperCase()}
          </div>
        )}
      </div>
    </div>
  );
}
