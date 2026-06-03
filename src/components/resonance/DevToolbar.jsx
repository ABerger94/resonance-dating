import { useState } from 'react';
import { Settings2, ChevronDown, ChevronUp } from 'lucide-react';
import { MOCK_PROFILES } from '@/lib/mockSeeder';
import useResonanceStore from '@/lib/resonanceStore';

export default function DevToolbar({ onScoreOverride }) {
  const [expanded, setExpanded] = useState(false);
  const { devSelectedMockId, setDevSelectedMockId, devOverrideScore, setDevOverrideScore } = useResonanceStore();

  const handleScoreChange = (val) => {
    const score = parseInt(val);
    setDevOverrideScore(score);
    onScoreOverride?.(score);
  };

  return (
    <div 
      className="fixed bottom-4 right-4 z-50 font-mono"
      style={{ maxWidth: '280px' }}
    >
      <div 
        className="border"
        style={{ 
          borderColor: '#FFB300',
          background: 'rgba(10,10,15,0.95)',
          boxShadow: '0 0 20px rgba(255,179,0,0.15)'
        }}
      >
        {/* Header */}
        <button 
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between p-2 hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Settings2 size={10} style={{ color: '#FFB300' }} />
            <span style={{ color: '#FFB300', fontSize: '9px', letterSpacing: '2px' }}>DEV TOOLBAR</span>
          </div>
          {expanded ? 
            <ChevronDown size={10} style={{ color: '#FFB300' }} /> : 
            <ChevronUp size={10} style={{ color: '#FFB300' }} />
          }
        </button>

        {expanded && (
          <div className="p-3 space-y-3 border-t" style={{ borderColor: '#332200' }}>
            {/* Mock user selector */}
            <div className="space-y-1">
              <label style={{ fontSize: '9px', color: '#666677', letterSpacing: '1px' }}>
                ACTIVE MOCK USER
              </label>
              <select
                value={devSelectedMockId || ''}
                onChange={(e) => setDevSelectedMockId(e.target.value)}
                className="w-full bg-transparent border px-2 py-1 text-xs text-foreground"
                style={{ 
                  borderColor: 'hsl(var(--border))',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '10px'
                }}
              >
                <option value="">-- SELECT MOCK --</option>
                {MOCK_PROFILES.map(p => (
                  <option key={p.id} value={p.mock_id}>
                    {p.handle} ({p.display_name})
                  </option>
                ))}
              </select>
            </div>

            {/* Score slider */}
            <div className="space-y-1">
              <div className="flex justify-between">
                <label style={{ fontSize: '9px', color: '#666677', letterSpacing: '1px' }}>
                  OVERRIDE SCORE
                </label>
                <span style={{ color: '#FFB300', fontSize: '11px', fontWeight: 'bold' }}>
                  {devOverrideScore ?? '--'}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={devOverrideScore ?? 0}
                onChange={(e) => handleScoreChange(e.target.value)}
                className="w-full"
                style={{ accentColor: '#00FF88' }}
              />
              <div className="flex justify-between text-muted-foreground/40" style={{ fontSize: '9px' }}>
                <span>LOCKED</span>
                <span>DISCOVERING</span>
                <span>RESONATING</span>
              </div>
            </div>

            {/* Quick set buttons */}
            <div className="flex gap-1">
              {[0, 25, 50, 75, 100].map(v => (
                <button
                  key={v}
                  onClick={() => handleScoreChange(v)}
                  className="flex-1 py-0.5 border text-xs transition-colors hover:border-primary/50 hover:text-primary"
                  style={{ 
                    borderColor: 'hsl(var(--border))',
                    fontSize: '9px',
                    color: devOverrideScore === v ? '#00FF88' : '#555566'
                  }}
                >
                  {v}
                </button>
              ))}
            </div>

            <div className="text-muted-foreground/30 leading-relaxed" style={{ fontSize: '8px' }}>
              Score override affects the active thread's DynamicProfile reveal in real-time.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}