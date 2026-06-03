import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { MOCK_THREADS } from '@/lib/mockSeeder';
import { getRandomPrompt } from '@/lib/promptEngine';
import VoidBubble from '@/components/resonance/VoidBubble';
import useResonanceStore from '@/lib/resonanceStore';
import { useAuth } from '@/lib/AuthContext';
import { canUseAdminTools, isJoinableThread } from '@/lib/security';
import { Radio, Plus, X } from 'lucide-react';

export default function Void() {
  const navigate = useNavigate();
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const canvasRef = useRef(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [showCastForm, setShowCastForm] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [customTags, setCustomTags] = useState('');
  const [casting, setCasting] = useState(false);
  const [useCustomText, setUseCustomText] = useState(false);
  const [customText, setCustomText] = useState('');
  const { user: authUser } = useAuth();
  const { seederEnabled, currentUser, currentProfile } = useResonanceStore();
  const activeUser = currentUser || authUser;
  const showMockData = canUseAdminTools(activeUser) && seederEnabled;

  useEffect(() => {
    loadVoidThreads();
  }, [showMockData, activeUser?.id]);

  useEffect(() => {
    setSelectedPrompt(getRandomPrompt());
  }, []);

  const loadVoidThreads = async () => {
    setLoading(true);
    try {
      const real = await base44.entities.Thread.filter({ status: 'void' }, '-created_date', 30);
      const visibleReal = activeUser
        ? real.filter(thread => thread.creator_id !== activeUser.id && thread.joiner_id !== activeUser.id)
        : real;
      const mockData = showMockData ? MOCK_THREADS : [];
      setThreads([...visibleReal, ...mockData]);
    } catch (e) {
      console.error(e);
      if (showMockData) setThreads(MOCK_THREADS);
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
      const me = activeUser;
      if (!me) return;
      if (!isJoinableThread(thread, me.id)) return;
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
    if (!selectedPrompt || !activeUser) return;
    setCasting(true);
    try {
      const promptText = useCustomText ? customText.trim() : selectedPrompt.text;
      const tags = customTags 
        ? customTags.split(',').map(t => t.trim()).filter(Boolean)
        : (useCustomText ? [] : selectedPrompt.tags);

      const thread = await base44.entities.Thread.create({
        creator_id: activeUser.id,
        creator_handle: currentProfile?.handle || `NODE_${activeUser.id.slice(-4).toUpperCase()}`,
        prompt_id: useCustomText ? null : selectedPrompt.id,
        prompt_text: promptText,
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

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setCanvasSize({ width: el.offsetWidth, height: el.offsetHeight });
    });
    ro.observe(el);
    setCanvasSize({ width: el.offsetWidth, height: el.offsetHeight });
    return () => ro.disconnect();
  }, []);

  return (
    <div className="flex flex-col font-mono" style={{ height: 'calc(100vh - 64px)', background: 'hsl(var(--background))' }}>
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

      {/* Cast form — overlay panel */}
      {showCastForm && (
        <div className="border-b px-6 py-5 space-y-4"
          style={{
            borderColor: 'rgba(14,165,233,0.3)',
            background: 'rgba(14,165,233,0.02)',
          }}
        >
          <div className="max-w-2xl mx-auto space-y-4">
          <div 
            className="border p-5 space-y-4"
            style={{ 
              borderColor: 'rgba(14,165,233,0.3)',
              background: 'rgba(14,165,233,0.02)',
            }}
          >
            <div className="flex items-center gap-2 text-primary text-xs tracking-widest">
              <span>◈</span>
              <span>CAST NEW THREAD INTO THE VOID</span>
            </div>

            {/* Toggle */}
            <div className="flex items-center gap-0 border" style={{ borderColor: 'hsl(var(--border))', width: 'fit-content' }}>
              <button
                onClick={() => setUseCustomText(false)}
                className="px-3 py-1.5 text-xs tracking-widest transition-all"
                style={{
                  background: !useCustomText ? 'rgba(14,165,233,0.15)' : 'transparent',
                  color: !useCustomText ? 'hsl(var(--primary))' : 'hsl(215 20% 52%)',
                  fontFamily: "'JetBrains Mono', monospace"
                }}
              >
                USE PROMPT
              </button>
              <button
                onClick={() => setUseCustomText(true)}
                className="px-3 py-1.5 text-xs tracking-widest transition-all"
                style={{
                  background: useCustomText ? 'rgba(14,165,233,0.15)' : 'transparent',
                  color: useCustomText ? 'hsl(var(--primary))' : 'hsl(215 20% 52%)',
                  fontFamily: "'JetBrains Mono', monospace"
                }}
              >
                WRITE YOUR OWN
              </button>
            </div>

            {useCustomText ? (
              /* Custom text input */
              <textarea
                placeholder="Ask something real. The more specific, the better the match."
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                rows={4}
                className="w-full bg-transparent border px-3 py-3 text-sm text-foreground placeholder:text-muted-foreground/25 outline-none focus:border-primary/30 resize-none"
                style={{ borderColor: 'hsl(var(--border))', fontFamily: "'JetBrains Mono', monospace" }}
              />
            ) : (
              <>
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
                <button
                  onClick={shufflePrompt}
                  className="px-3 py-1.5 border text-xs tracking-widest transition-all hover:border-primary/50 hover:text-primary w-fit"
                  style={{ borderColor: 'hsl(var(--border))' }}
                >
                  ↻ SHUFFLE PROMPT
                </button>
              </>
            )}

            {/* Tags */}
            <input
              type="text"
              placeholder="tags (comma separated, optional)"
              value={customTags}
              onChange={(e) => setCustomTags(e.target.value)}
              className="w-full bg-transparent border px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/30 outline-none focus:border-primary/30"
              style={{ borderColor: 'hsl(var(--border))', fontFamily: "'JetBrains Mono', monospace" }}
            />

            <button
              onClick={handleCastThread}
              disabled={casting || (useCustomText ? !customText.trim() : !selectedPrompt)}
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
          </div>
        </div>
      )}

      {/* Floating bubble canvas */}
      <div
        ref={canvasRef}
        className="flex-1 relative overflow-hidden"
        style={{ background: 'hsl(var(--background))' }}
      >
        {/* Subtle void background grid */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: 'radial-gradient(circle, rgba(14,165,233,0.04) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }} />

        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-muted-foreground/50 text-xs tracking-widest animate-pulse">
              SCANNING THE VOID...
            </div>
          </div>
        ) : threads.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <div className="text-muted-foreground/30 text-xs tracking-widest">// VOID IS EMPTY</div>
            <div className="text-muted-foreground/20 text-xs">Cast the first thread to initiate contact.</div>
          </div>
        ) : canvasSize.width > 0 && (
          threads.map((thread, i) => (
            <VoidBubble
              key={thread.id}
              thread={thread}
              index={i}
              onJoin={handleJoinThread}
              containerWidth={canvasSize.width}
              containerHeight={canvasSize.height}
            />
          ))
        )}
      </div>
    </div>
  );
}
