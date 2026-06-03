import { useEffect, useState } from 'react';
import { getResonanceState, getNextUnlock, getStateColor } from '@/lib/resonanceEngine';
import { Check, Circle, Lock, Play, Radio, Zap } from 'lucide-react';

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
  const filled = Math.round((displayScore / 100) * 20);
  const empty = 20 - filled;

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

  const thresholds = [
    { score: 25, label: 'NAME', reached: score >= 25 },
    { score: 50, label: 'INTS', reached: score >= 50 },
    { score: 75, label: 'BIO', reached: score >= 75 },
    { score: 100, label: 'PHOTO', reached: score >= 100 },
  ];

  return (
    <div className={`font-mono text-xs space-y-3 ${className}`}>
      <div className={`flex items-center gap-2 ${getStateColor(state)}`}>
        <StateIcon size={12} />
        <span className="tracking-widest">{STATE_LABELS[state]}</span>
        {state === 'resonating' && <Circle size={8} className="animate-pulse text-primary fill-current" />}
      </div>

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

      <div className="space-y-1">
        <div className="flex gap-0.5" aria-label={`${displayScore} percent resonance`}>
          {Array.from({ length: filled }).map((_, index) => (
            <span
              key={`filled-${index}`}
              className="h-3 w-1.5"
              style={{
                background: state === 'resonating' ? '#0EA5E9' :
                  state === 'discovering' ? '#10B981' : 'hsl(215 20% 52%)'
              }}
            />
          ))}
          {Array.from({ length: empty }).map((_, index) => (
            <span key={`empty-${index}`} className="h-3 w-1.5 bg-muted-foreground/20" />
          ))}
        </div>
        <div className="flex justify-between text-muted-foreground/50" style={{ fontSize: '9px' }}>
          <span>0</span>
          <span>25</span>
          <span>50</span>
          <span>75</span>
          <span>100</span>
        </div>
      </div>

      <div className="space-y-1">
        <div className="text-muted-foreground/60 tracking-widest" style={{ fontSize: '9px' }}>UNLOCK SEQUENCE</div>
        {thresholds.map(threshold => (
          <div key={threshold.label} className="flex items-center gap-2">
            <span
              className="inline-flex items-center"
              style={{
                color: threshold.reached ? '#0EA5E9' : 'hsl(215 20% 70%)',
                fontSize: '10px'
              }}
            >
              {threshold.reached ? <Play size={9} className="fill-current" /> : <Circle size={9} />}
            </span>
            <span
              style={{
                fontSize: '10px',
                color: threshold.reached ? 'hsl(215 41% 18%)' : 'hsl(215 20% 60%)',
                fontFamily: "'JetBrains Mono', monospace"
              }}
            >
              [{String(threshold.score).padStart(3, '0')}%] {threshold.label}
            </span>
            {threshold.reached && (
              <span className="inline-flex items-center gap-1" style={{ color: '#10B981', fontSize: '9px' }}>
                <Check size={9} />
                UNLOCKED
              </span>
            )}
          </div>
        ))}
      </div>

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
        <div className="flex items-center gap-2 text-primary text-xs animate-pulse tracking-widest">
          <Circle size={8} className="fill-current" />
          FULL RESONANCE ACHIEVED
          <Circle size={8} className="fill-current" />
        </div>
      )}
    </div>
  );
}
