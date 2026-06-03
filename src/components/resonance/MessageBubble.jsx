import { formatDistanceToNow } from 'date-fns';

export default function MessageBubble({ message, isOwn }) {
  const time = message.created_date 
    ? formatDistanceToNow(new Date(message.created_date), { addSuffix: true }).toUpperCase()
    : '';

  const wordCount = message.word_count || message.content?.split(/\s+/).filter(Boolean).length || 0;

  return (
    <div className={`flex flex-col gap-1 ${isOwn ? 'items-end' : 'items-start'}`}>
      {/* Handle */}
      <div className="flex items-center gap-2" style={{ fontSize: '9px' }}>
        <span 
          className="tracking-widest"
          style={{ color: isOwn ? '#10B981' : '#F59E0B' }}
        >
          {isOwn ? 'YOU' : (message.sender_handle || 'SIGNAL_??')}
        </span>
        <span className="text-muted-foreground/40">{time}</span>
      </div>

      {/* Content */}
      <div
        className="max-w-lg text-sm leading-relaxed p-3 font-mono"
        style={{
          background: isOwn ? 'rgba(16,185,129,0.04)' : 'hsl(var(--card))',
          border: `1px solid ${isOwn ? 'rgba(16,185,129,0.2)' : 'hsl(var(--border))'}`,
          borderLeft: isOwn ? '1px solid rgba(16,185,129,0.2)' : '2px solid rgba(245,158,11,0.3)',
          color: 'hsl(var(--foreground))',
          fontFamily: "'JetBrains Mono', monospace"
        }}
      >
        {!isOwn && <span style={{ color: '#F59E0B' }} className="mr-1">&gt;</span>}
        {message.content}
      </div>

      {/* Metadata bar */}
      <div className="flex items-center gap-3 text-muted-foreground/30" style={{ fontSize: '9px' }}>
        <span>{wordCount}W</span>
        {message.unique_word_ratio > 0 && (
          <span>UWR:{Math.round(message.unique_word_ratio * 100)}%</span>
        )}
        {message.sentiment_score !== undefined && message.sentiment_score !== 0 && (
          <span style={{ color: message.sentiment_score > 0 ? '#10B981' : 'hsl(var(--destructive))' }}>
            SENT:{message.sentiment_score > 0 ? '+' : ''}{message.sentiment_score.toFixed(2)}
          </span>
        )}
      </div>
    </div>
  );
}
