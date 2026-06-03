import { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { calculateResonanceScore, getResonanceState, analyzeMessage } from '@/lib/resonanceEngine';
import { MOCK_PROFILES, generateMockInteractionsForScore } from '@/lib/mockSeeder';
import ResonanceMeter from '@/components/resonance/ResonanceMeter';
import DynamicProfile from '@/components/resonance/DynamicProfile';
import MessageBubble from '@/components/resonance/MessageBubble';
import DevToolbar from '@/components/resonance/DevToolbar';
import useResonanceStore from '@/lib/resonanceStore';
import { ArrowLeft, Send, Terminal, ChevronRight, ChevronDown } from 'lucide-react';

export default function Sandbox() {
  const { threadId } = useParams();
  const [searchParams] = useSearchParams();
  const isMock = searchParams.get('mock') === 'true';
  const navigate = useNavigate();

  const { currentUser, currentProfile, seederEnabled, devMode, devOverrideScore, devSelectedMockId } = useResonanceStore();

  const [thread, setThread] = useState(null);
  const [interactions, setInteractions] = useState([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [resonanceScore, setResonanceScore] = useState(0);
  const [previousScore, setPreviousScore] = useState(0);
  const [otherProfile, setOtherProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [promptCompleted, setPromptCompleted] = useState(false);
  const [displayScore, setDisplayScore] = useState(0);
  const [showMobileProfile, setShowMobileProfile] = useState(false);
  const messagesEndRef = useRef(null);
  const lastMessageTimeRef = useRef(null);

  useEffect(() => {
    loadThread();
  }, [threadId, isMock]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [interactions]);

  // Apply dev score override
  useEffect(() => {
    if (devMode && devOverrideScore !== null) {
      setDisplayScore(devOverrideScore);
    } else {
      setDisplayScore(resonanceScore);
    }
  }, [devMode, devOverrideScore, resonanceScore]);

  const loadThread = async () => {
    setLoading(true);
    if (isMock) {
      // Load mock thread
      const { MOCK_THREADS } = await import('../lib/mockSeeder');
      const mockThread = MOCK_THREADS.find(t => t.id === threadId) || MOCK_THREADS[0];
      setThread(mockThread);

      // Get a mock profile
      const profileIndex = Math.floor(Math.random() * MOCK_PROFILES.length);
      const profile = { ...MOCK_PROFILES[profileIndex] };
      setOtherProfile(profile);

      // Generate mock interactions matching the profile's default score
      const mockInts = generateMockInteractionsForScore(
        profile.resonance_score || 30,
        threadId,
        'you',
        profile.mock_id
      );
      setInteractions(mockInts);
      const score = Math.min(profile.resonance_score || 30, 100);
      setResonanceScore(score);
      setDisplayScore(score);
    } else {
      try {
        const t = await base44.entities.Thread.get(threadId);
        setThread(t);
        setResonanceScore(t.resonance_score || 0);
        setDisplayScore(t.resonance_score || 0);

        const ints = await base44.entities.Interaction.filter({ thread_id: threadId }, 'created_date', 100);
        setInteractions(ints);

        // Load other user's profile
        if (currentUser && t) {
          const otherId = t.creator_id === currentUser.id ? t.joiner_id : t.creator_id;
          if (otherId) {
            try {
              const profiles = await base44.entities.UserProfile.filter({ user_id: otherId });
              if (profiles.length > 0) setOtherProfile(profiles[0]);
            } catch (e) {}
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
    setLoading(false);
  };

  const handleSend = async () => {
    if (!inputText.trim() || sending) return;
    setSending(true);

    const content = inputText.trim();
    const analysis = analyzeMessage(content);
    const now = Date.now();
    const latency = lastMessageTimeRef.current ? now - lastMessageTimeRef.current : 0;
    lastMessageTimeRef.current = now;

    const newInteraction = {
      id: `local_${now}`,
      thread_id: threadId,
      sender_id: currentUser?.id || 'you',
      sender_handle: currentProfile?.handle || 'YOU',
      content,
      word_count: analysis.wordCount,
      unique_word_ratio: analysis.uniqueWordRatio,
      sentiment_score: analysis.sentimentScore,
      prompt_completed: promptCompleted,
      response_latency_ms: latency,
      created_date: new Date().toISOString(),
      is_mock: isMock
    };

    const updatedInteractions = [...interactions, newInteraction];
    setInteractions(updatedInteractions);
    setInputText('');
    setPromptCompleted(false);

    // Recalculate score
    const newScore = calculateResonanceScore(updatedInteractions);
    const newState = getResonanceState(newScore);
    setPreviousScore(resonanceScore);
    setResonanceScore(newScore);
    if (!devMode) setDisplayScore(newScore);

    // Persist if not mock
    if (!isMock && currentUser) {
      try {
        await base44.entities.Interaction.create({
          thread_id: threadId,
          sender_id: currentUser.id,
          sender_handle: currentProfile?.handle || 'SIGNAL',
          content,
          word_count: analysis.wordCount,
          unique_word_ratio: analysis.uniqueWordRatio,
          sentiment_score: analysis.sentimentScore,
          prompt_completed: promptCompleted,
          response_latency_ms: latency
        });
        await base44.entities.Thread.update(threadId, {
          resonance_score: newScore,
          resonance_state: newState,
          last_activity: new Date().toISOString()
        });
      } catch (e) {
        console.error(e);
      }
    }

    setSending(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center font-mono">
        <div className="text-primary animate-pulse tracking-widest text-xs">ESTABLISHING CONNECTION...</div>
      </div>
    );
  }

  const effectiveScore = (devMode && devOverrideScore !== null) ? devOverrideScore : displayScore;

  return (
    <div className="h-screen flex flex-col font-mono" style={{ background: 'hsl(var(--background))' }}>
      {/* Top bar */}
      <div className="flex-none border-b px-4 py-3 flex items-center justify-between" style={{ borderColor: 'hsl(var(--border))' }}>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/void')}
            className="flex items-center gap-1.5 text-muted-foreground/60 hover:text-foreground transition-colors"
            style={{ fontSize: '10px' }}
          >
            <ArrowLeft size={10} />
            <span className="tracking-widest">VOID</span>
          </button>
          <span className="text-muted-foreground/30">/</span>
          <Terminal size={10} className="text-primary/60" />
          <span className="text-xs tracking-widest text-muted-foreground">
            {thread?.creator_handle || 'THREAD'}
          </span>
        </div>
        <div 
          className="text-xs tracking-widest"
          style={{ 
            color: effectiveScore >= 60 ? '#00FF88' : effectiveScore >= 25 ? '#FFB300' : '#555566',
            fontSize: '10px'
          }}
        >
          RESONANCE: {String(effectiveScore).padStart(3, '0')}%
        </div>
      </div>

      {/* Mobile-only resonance strip */}
      <div
        className="md:hidden flex-none border-b px-4 py-2 flex items-center justify-between cursor-pointer active:bg-muted/30 transition-colors"
        style={{ borderColor: 'hsl(var(--border))' }}
        onClick={() => setShowMobileProfile(!showMobileProfile)}
      >
        <div className="flex items-center gap-2">
          <span style={{ fontSize: '9px', color: 'hsl(230 15% 55%)', letterSpacing: '2px' }}>RESONANCE</span>
          <span
            className="font-bold tabular-nums"
            style={{
              fontSize: '12px',
              color: effectiveScore >= 60 ? 'hsl(258 90% 60%)' : effectiveScore >= 25 ? 'hsl(320 85% 60%)' : 'hsl(230 15% 55%)',
              fontFamily: "'JetBrains Mono', monospace"
            }}
          >
            {String(effectiveScore).padStart(3, '0')}%
          </span>
          {/* mini bar */}
          <div className="flex gap-px">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="w-1.5 h-3 rounded-sm"
                style={{
                  background: i < Math.round(effectiveScore / 10)
                    ? effectiveScore >= 60 ? 'hsl(258 90% 60%)' : effectiveScore >= 25 ? 'hsl(320 85% 60%)' : 'hsl(230 15% 55%)'
                    : 'hsl(var(--border))'
                }}
              />
            ))}
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span style={{ fontSize: '9px', color: 'hsl(230 15% 55%)', letterSpacing: '1px' }}>SIGNAL PROFILE</span>
          <ChevronDown
            size={12}
            className="text-muted-foreground transition-transform"
            style={{ transform: showMobileProfile ? 'rotate(180deg)' : 'rotate(0deg)' }}
          />
        </div>
      </div>

      {/* Mobile profile panel */}
      {showMobileProfile && (
        <div
          className="md:hidden flex-none border-b overflow-y-auto max-h-64 p-4"
          style={{ borderColor: 'hsl(var(--border))', background: 'hsl(var(--card))' }}
        >
          <DynamicProfile
            profile={otherProfile}
            score={effectiveScore}
            previousScore={previousScore}
            threadId={threadId}
          />
        </div>
      )}

      {/* Main layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Messages */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0">
          {/* Prompt banner */}
          {thread?.prompt_text && (
            <div 
              className="flex-none border-b px-4 py-3"
              style={{ borderColor: 'hsl(var(--border))', background: 'rgba(0,255,136,0.02)' }}
            >
              <div className="flex items-start gap-2">
                <ChevronRight size={10} className="text-primary/60 mt-0.5 flex-none" />
                <div>
                  <div className="text-muted-foreground/50 mb-1" style={{ fontSize: '9px', letterSpacing: '2px' }}>
                    ACTIVE PROMPT
                  </div>
                  <div className="text-sm text-foreground/80">{thread.prompt_text}</div>
                </div>
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {interactions.length === 0 ? (
              <div className="text-center py-12 space-y-2">
                <div className="text-muted-foreground/30 text-xs tracking-widest">// AWAITING FIRST TRANSMISSION</div>
                <div className="text-muted-foreground/20 text-xs">Respond to the prompt above to begin.</div>
              </div>
            ) : (
              interactions.map((msg, i) => (
                <MessageBubble
                  key={msg.id || i}
                  message={msg}
                  isOwn={msg.sender_id === (currentUser?.id || 'you')}
                />
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="flex-none border-t p-3 space-y-2" style={{ borderColor: 'hsl(var(--border))' }}>
            {/* Prompt complete toggle */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPromptCompleted(!promptCompleted)}
                className="flex items-center gap-1.5 transition-colors"
                style={{ fontSize: '9px', color: promptCompleted ? '#00FF88' : '#444455' }}
              >
                <span>{promptCompleted ? '■' : '□'}</span>
                <span className="tracking-widest">MARK AS PROMPT RESPONSE (+SCORE)</span>
              </button>
            </div>
            
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <span 
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/40"
                  style={{ fontSize: '12px' }}
                >&gt;</span>
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="transmit..."
                  rows={3}
                  className="w-full bg-transparent border pl-7 pr-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/20 outline-none focus:border-primary/30 resize-none"
                  style={{ 
                    borderColor: 'hsl(var(--border))',
                    fontFamily: "'JetBrains Mono', monospace"
                  }}
                />
              </div>
              <button
                onClick={handleSend}
                disabled={!inputText.trim() || sending}
                className="px-3 border transition-all disabled:opacity-30 hover:border-primary/50 hover:text-primary"
                style={{ 
                  borderColor: 'hsl(var(--border))',
                  color: '#555566'
                }}
              >
                <Send size={12} />
              </button>
            </div>
            <div className="text-muted-foreground/30 tracking-widest" style={{ fontSize: '9px' }}>
              ENTER TO SEND · SHIFT+ENTER FOR NEWLINE
            </div>
          </div>
        </div>

        {/* Right sidebar — hidden on mobile */}
        <div 
          className="hidden md:flex w-72 flex-none border-l flex-col overflow-y-auto"
          style={{ borderColor: 'hsl(var(--border))' }}
        >
          {/* Resonance Meter */}
          <div className="border-b p-4" style={{ borderColor: 'hsl(var(--border))' }}>
            <div className="text-muted-foreground/50 text-xs tracking-widest mb-3" style={{ fontSize: '9px' }}>
              ◈ RESONANCE METER
            </div>
            <ResonanceMeter score={effectiveScore} />
          </div>

          {/* Dynamic Profile */}
          <div className="p-4">
            <div className="text-muted-foreground/50 text-xs tracking-widest mb-3" style={{ fontSize: '9px' }}>
              ◈ SIGNAL PROFILE
            </div>
            <DynamicProfile
              profile={otherProfile}
              score={effectiveScore}
              previousScore={previousScore}
              threadId={threadId}
            />
          </div>
        </div>
      </div>

      {/* Dev toolbar */}
      {devMode && <DevToolbar onScoreOverride={(s) => setDisplayScore(s)} />}
    </div>
  );
}