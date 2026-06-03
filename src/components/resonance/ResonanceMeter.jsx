import { useEffect, useState } from 'react';
import { renderSegmentedBar, getResonanceState, getNextUnlock, getStateColor } from '@/lib/resonanceEngine';
import { Zap, Lock, Radio } from 'lucide-react';

const STATE_ICONS = {
  locked: Lock,
  discovering: Radio,
  resonating: Zap
};

const STATE_LABELS = {
  locked: 'LOCKED',
  discovering: 'DISCOVERING',
  resonating: 'RESONATING'
};

export default function ResonanceMeter({ score = 0, className = '' }) {
  const [displayScore, setDisplayScore] = useState(0);
  const state = getResonanceState(score);
  const nextUnlock = getNextUnlock(score);
  const StateIcon = STATE_ICONS[state];

  // Animate score counter
  useEffect(() => {
    if (displayScore === score) return;
    const diff = score - displayScore;
    const step = diff > 0 ? 1 : -1;
    const timer = setTimeout(() => {
      setDisplayScore(prev => {
        const next = prev + step;
        if (step > 0 && next >= score) return score;
        if (step < 0 && next <= score) return score;
        return next;
      });
    }, 20);
    return () => clearTimeout(timer);
  }, [displayScore, score]);

  const bar = renderSegmentedBar(displayScore, 20);
  const filled = bar.split('').filter(c => c === '█').length;
  const empty = 20 - filled;

  const thresholds = [
    { score: 25, label: 'NAME', reached: score >= 25 },
    { score: 50, label: 'BIO', reached: score >= 50 },
    { score: 75, label: 'INTS', reached: score >= 75 },
    { score: 100, label: 'PHOTO', reached: score >= 100 },
  ];

  return (
    <div className={`font-mono text-xs space-y-3 ${className}`}>
      {/* State header */}
      <div className={`flex items-center gap-2 ${getStateColor(state)}`}>
        <StateIcon size={12} />
        <span className="tracking-widest">{STATE_LABELS[state]}</span>
        {state === 'resonating' && (
          <span className="animate-pulse text-primary">●</span>
        )}
      </div>

      {/* Score counter */}
      <div className="flex items-baseline gap-1">
        <span 
          className="text-2xl font-bold tabular-nums"
          style={{ 
            color: state === 'resonating' ? '#0EA5E9' : 
                   state === 'discovering' ? '#10B981' : 'hsl(215 20% 52%)',
            fontFamily: "'JetBrains Mono', monospace"
          }}
        >
          {String(displayScore).padStart(3, '0')}
        </span>
        <span className="text-muted-foreground">/ 100</span>
      </div>

      {/* Segmented bar */}
      <div className="space-y-1">
        <div 
          className="tracking-wider text-sm"
          style={{ 
            letterSpacing: '2px',
            fontFamily: "'JetBrains Mono', monospace"
          }}
        >
          <span style={{ 
            color: state === 'resonating' ? '#0EA5E9' : 
                   state === 'discovering' ? '#10B981' : 'hsl(215 20% 52%)' 
          }}>
            {'█'.repeat(filled)}
          </span>
          <span className="text-muted-foreground/30">{'░'.repeat(empty)}</span>
        </div>
        <div className="flex justify-between text-muted-foreground/50" style={{ fontSize: '9px' }}>
          <span>0</span>
          <span>25</span>
          <span>50</span>
          <span>75</span>
          <span>100</span>
        </div>
      </div>

      {/* Unlock thresholds */}
      <div className="space-y-1">
        <div className="text-muted-foreground/60 tracking-widest" style={{ fontSize: '9px' }}>UNLOCK SEQUENCE</div>
        {thresholds.map(t => (
          <div key={t.label} className="flex items-center gap-2">
            <span style={{ 
              color: t.reached ? '#0EA5E9' : 'hsl(215 20% 70%)',
              fontSize: '10px'
            }}>
              {t.reached ? '▶' : '○'}
            </span>
            <span style={{ 
              fontSize: '10px',
              color: t.reached ? 'hsl(215 41% 18%)' : 'hsl(215 20% 60%)',
              fontFamily: "'JetBrains Mono', monospace"
            }}>
              [{String(t.score).padStart(3, '0')}%] {t.label}
            </span>
            {t.reached && (
              <span style={{ color: '#10B981', fontSize: '9px' }}>✓ UNLOCKED</span>
            )}
          </div>
        ))}
      </div>

      {/* Next unlock hint */}
      {nextUnlock && (
        <div 
          className="border-t pt-2 text-muted-foreground/60"
          style={{ borderColor: 'hsl(var(--border))', fontSize: '9px' }}
        >
          NEXT: {nextUnlock.field.toUpperCase()} @ {nextUnlock.threshold}% 
          <span className="text-primary ml-1">(+{nextUnlock.threshold - score}%)</span>
        </div>
      )}

      {score >= 100 && (
        <div className="text-primary text-xs animate-pulse tracking-widest">
          ◈ FULL RESONANCE ACHIEVED ◈
        </div>
      )}
    </div>
  );
}