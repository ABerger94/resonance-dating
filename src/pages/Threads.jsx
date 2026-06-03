import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import ThreadCard from '@/components/resonance/ThreadCard';
import useResonanceStore from '@/lib/resonanceStore';
import { ArrowRight, Circle, MessageSquare, Plus } from 'lucide-react';

export default function Threads() {
  const navigate = useNavigate();
  const { currentUser } = useResonanceStore();
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    loadMyThreads();
  }, [currentUser]);

  const loadMyThreads = async () => {
    setLoading(true);
    try {
      if (!currentUser) return;
      const created = await base44.entities.Thread.filter({ creator_id: currentUser.id }, '-updated_date', 50);
      const joined = await base44.entities.Thread.filter({ joiner_id: currentUser.id }, '-updated_date', 50);
      const all = [...created, ...joined];
      const seen = new Set();
      const unique = all.filter(thread => {
        if (seen.has(thread.id)) return false;
        seen.add(thread.id);
        return true;
      });
      setThreads(unique.sort((a, b) => new Date(b.updated_date) - new Date(a.updated_date)));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const stateGroups = {
    resonating: threads.filter(thread => thread.resonance_state === 'resonating'),
    discovering: threads.filter(thread => thread.resonance_state === 'discovering'),
    locked: threads.filter(thread => thread.resonance_state === 'locked' || !thread.resonance_state)
  };

  const stateColors = {
    resonating: '#0EA5E9',
    discovering: '#10B981',
    locked: 'hsl(215 20% 52%)'
  };

  return (
    <div className="min-h-screen font-mono" style={{ background: 'hsl(var(--background))' }}>
      <div className="border-b px-6 py-4" style={{ borderColor: 'hsl(var(--border))' }}>
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageSquare size={14} className="text-primary" />
            <span className="text-primary font-bold tracking-widest text-sm">ACTIVE THREADS</span>
            <span className="text-muted-foreground/50" style={{ fontSize: '10px' }}>
              // {threads.length} OPEN
            </span>
          </div>
          <button
            onClick={() => navigate('/void')}
            className="flex items-center gap-2 px-3 py-1.5 border text-xs tracking-widest hover:border-primary/50 hover:text-primary transition-all"
            style={{ borderColor: 'hsl(var(--border))' }}
          >
            <Plus size={10} />
            NEW THREAD
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-6 space-y-6">
        {loading ? (
          <div className="text-muted-foreground/40 text-xs tracking-widest animate-pulse py-8 text-center">
            LOADING THREADS...
          </div>
        ) : threads.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <div className="text-muted-foreground/30 text-xs tracking-widest">// NO ACTIVE THREADS</div>
            <div className="text-muted-foreground/20 text-xs">Visit the Void to start a connection.</div>
            <button
              onClick={() => navigate('/void')}
              className="mt-4 px-4 py-2 border text-xs tracking-widest hover:border-primary/50 hover:text-primary transition-all"
              style={{ borderColor: 'hsl(var(--border))' }}
            >
              <ArrowRight size={12} className="inline mr-1" />
              ENTER THE VOID
            </button>
          </div>
        ) : (
          Object.entries(stateGroups).map(([state, group]) =>
            group.length > 0 && (
              <div key={state} className="space-y-2">
                <div className="flex items-center gap-2" style={{ fontSize: '9px' }}>
                  <Circle size={8} className="fill-current" style={{ color: stateColors[state] }} />
                  <span className="tracking-widest text-muted-foreground/60">{state.toUpperCase()} ({group.length})</span>
                </div>
                {group.map(thread => (
                  <ThreadCard
                    key={thread.id}
                    thread={thread}
                    isActive={activeId === thread.id}
                    onClick={() => {
                      setActiveId(thread.id);
                      navigate(`/sandbox/${thread.id}`);
                    }}
                  />
                ))}
              </div>
            )
          )
        )}
      </div>
    </div>
  );
}
