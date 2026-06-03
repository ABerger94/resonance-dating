import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { MOCK_THREADS } from '@/lib/mockSeeder';
import { getRandomPrompt } from '@/lib/promptEngine';
import VoidThreadCard from '@/components/resonance/VoidThreadCard';
import useResonanceStore from '@/lib/resonanceStore';
import { Radio, Plus, X } from 'lucide-react';

export default function Void() {
  const navigate = useNavigate();
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCastForm, setShowCastForm] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [customTags, setCustomTags] = useState('');
  const [casting, setCasting] = useState(false);
  const { seederEnabled, currentUser, currentProfile } = useResonanceStore();

  useEffect(() => {
    loadVoidThreads();
  }, [seederEnabled]);

  useEffect(() => {
    setSelectedPrompt(getRandomPrompt());
  }, []);

  const loadVoidThreads = async () => {
    setLoading(true);
    try {
      const real = await base44.entities.Thread.filter({ status: 'void' }, '-created_date', 30);
      const mockData = seederEnabled ? MOCK_THREADS : [];
      setThreads([...real, ...mockData]);
    } catch (e) {
      console.error(e);
      if (seederEnabled) setThreads(MOCK_THREADS);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinThread = async (thread) => {
    if (thread.is_mock) {
      navigate(`/sandbox/${thread.id}?mock=true`);
      return;
    }
    try {
      const me = currentUser;
      if (!me) return;
      await base44.entities.Thread.update(thread.id, {
        joiner_id: me.id,
        joiner_handle: currentProfile?.handle || `SIGNAL_${me.id.slice(-4).toUpperCase()}`,
        status: 'active',
        last_activity: new Date().toISOString()
      });
      navigate(`/sandbox/${thread.id}`);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCastThread = async () => {
    if (!selectedPrompt || !currentUser) return;
    setCasting(true);
    try {
      const tags = customTags 
        ? customTags.split(',').map(t => t.trim()).filter(Boolean)
        : selectedPrompt.tags;

      const thread = await base44.entities.Thread.create({
        creator_id: currentUser.id,
        creator_handle: currentProfile?.handle || `NODE_${currentUser.id.slice(-4).toUpperCase()}`,
        prompt_id: selectedPrompt.id,
        prompt_text: selectedPrompt.text,
        topic_tags: tags,
        status: 'void',
        resonance_state: 'locked',
        resonance_score: 0,
        last_activity: new Date().toISOString()
      });

      setShowCastForm(false);
      navigate(`/sandbox/${thread.id}`);
    } catch (e) {
      console.error(e);
    } finally {
      setCasting(false);
    }
  };

  const shufflePrompt = () => setSelectedPrompt(getRandomPrompt());

  return (
    <div className="min-h-screen font-mono" style={{ background: 'hsl(var(--background))' }}>
      {/* Header */}
      <div 
        className="border-b px-6 py-4"
        style={{ borderColor: 'hsl(var(--border))' }}
      >
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Radio size={14} className="text-primary animate-pulse" />
            <span className="text-primary font-bold tracking-widest text-sm">THE VOID</span>
            <span className="text-muted-foreground/50 hidden sm:block" style={{ fontSize: '10px' }}>
              // {threads.length} THREAD{threads.length !== 1 ? 'S' : ''} FLOATING
            </span>
          </div>
          <button
            onClick={() => setShowCastForm(!showCastForm)}
            className="flex items-center gap-2 px-4 py-2 border text-xs tracking-widest transition-all hover:border-primary/50 hover:text-primary active:scale-95"
            style={{ borderColor: 'hsl(var(--border))' }}
          >
            {showCastForm ? <X size={12} /> : <Plus size={12} />}
            {showCastForm ? 'CANCEL' : 'CAST THREAD'}
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">

        {/* Cast form */}
        {showCastForm && (
          <div 
            className="border p-5 space-y-4 void-card"
            style={{ 
              borderColor: 'rgba(14,165,233,0.3)',
              background: 'rgba(14,165,233,0.02)',
              boxShadow: '0 0 30px rgba(14,165,233,0.06)'
            }}
          >
            <div className="flex items-center gap-2 text-primary text-xs tracking-widest">
              <span>◈</span>
              <span>CAST NEW THREAD INTO THE VOID</span>
            </div>

            {/* Selected prompt display */}
            <div 
              className="p-4 border"
              style={{ borderColor: 'hsl(var(--border))' }}
            >
              <div style={{ fontSize: '9px', color: '#555566', marginBottom: '8px' }}>
                [{selectedPrompt?.category}] CHALLENGE PROMPT
              </div>
              <div className="text-sm text-foreground/90">
                <span className="text-primary/50 mr-1">&gt;</span>
                {selectedPrompt?.text}
              </div>
              <div className="flex flex-wrap gap-1 mt-3">
                {selectedPrompt?.tags.map(tag => (
                  <span key={tag} style={{ fontSize: '9px', color: '#444455', border: '1px solid #222233', padding: '2px 6px' }}>
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Shuffle + custom tags */}
            <div className="flex items-center gap-3">
              <button
                onClick={shufflePrompt}
                className="px-3 py-1.5 border text-xs tracking-widest transition-all hover:border-primary/50 hover:text-primary"
                style={{ borderColor: 'hsl(var(--border))' }}
              >
                ↻ SHUFFLE PROMPT
              </button>
              <input
                type="text"
                placeholder="custom tags (comma separated)"
                value={customTags}
                onChange={(e) => setCustomTags(e.target.value)}
                className="flex-1 bg-transparent border px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/30 outline-none focus:border-primary/30"
                style={{ borderColor: 'hsl(var(--border))', fontFamily: "'JetBrains Mono', monospace" }}
              />
            </div>

            <button
              onClick={handleCastThread}
              disabled={casting || !selectedPrompt}
              className="w-full py-2 text-xs tracking-widest font-bold transition-all disabled:opacity-50"
              style={{ 
                background: 'rgba(16,185,129,0.1)',
                border: '1px solid rgba(16,185,129,0.4)',
                color: '#10B981'
              }}
            >
              {casting ? 'CASTING...' : '◈ CAST INTO THE VOID ◈'}
            </button>
          </div>
        )}

        {/* Thread grid */}
        {loading ? (
          <div className="text-muted-foreground/50 text-xs tracking-widest animate-pulse py-8 text-center">
            SCANNING THE VOID...
          </div>
        ) : threads.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <div className="text-muted-foreground/30 text-xs tracking-widest">// VOID IS EMPTY</div>
            <div className="text-muted-foreground/20 text-xs">Cast the first thread to initiate contact.</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {threads.map((thread, i) => (
              <VoidThreadCard
                key={thread.id}
                thread={thread}
                onJoin={handleJoinThread}
                style={{ animationDelay: `${i * 80}ms` }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}