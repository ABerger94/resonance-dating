// ResonanceEngine: pure scoring utility, stateless
// State machine: locked (0-24%) -> discovering (25-59%) -> resonating (60-100%)

const SENTIMENT_POSITIVE = [
  'love', 'amazing', 'brilliant', 'fascinating', 'beautiful', 'incredible',
  'profound', 'meaningful', 'wonderful', 'excellent', 'perfect', 'inspiring',
  'passionate', 'genuine', 'authentic', 'thoughtful', 'creative', 'unique'
];

const SENTIMENT_NEGATIVE = [
  'hate', 'terrible', 'awful', 'boring', 'stupid', 'dumb', 'pointless',
  'worthless', 'pathetic', 'disgusting', 'horrible', 'worst'
];

export function analyzeMessage(content) {
  const words = content.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const lowerWords = words.map(w => w.toLowerCase().replace(/[^a-z]/g, ''));
  const uniqueWords = new Set(lowerWords);
  const uniqueWordRatio = wordCount > 0 ? uniqueWords.size / wordCount : 0;

  let sentimentScore = 0;
  lowerWords.forEach(word => {
    if (SENTIMENT_POSITIVE.includes(word)) sentimentScore += 0.1;
    if (SENTIMENT_NEGATIVE.includes(word)) sentimentScore -= 0.05;
  });
  sentimentScore = Math.max(-1, Math.min(1, sentimentScore));

  return { wordCount, uniqueWordRatio, sentimentScore };
}

export function calculateResonanceScore(interactions, threadCreatedAt) {
  if (!interactions || interactions.length === 0) return 0;

  // --- 40% PROMPT PARTICIPATION ---
  const senderIds = [...new Set(interactions.map(i => i.sender_id))];
  const promptCompletionScore = (() => {
    if (senderIds.length < 2) return 0;
    const completedByBoth = senderIds.every(sid =>
      interactions.some(i => i.sender_id === sid && i.prompt_completed)
    );
    const completedByOne = senderIds.some(sid =>
      interactions.some(i => i.sender_id === sid && i.prompt_completed)
    );
    if (completedByBoth) return 1.0;
    if (completedByOne) return 0.4;
    return 0;
  })();

  // --- 35% MESSAGE DEPTH/VOCABULARY ---
  const depthScore = (() => {
    const avgWordCount = interactions.reduce((sum, i) => sum + (i.word_count || 0), 0) / interactions.length;
    const avgUniqueRatio = interactions.reduce((sum, i) => sum + (i.unique_word_ratio || 0), 0) / interactions.length;
    const avgSentiment = interactions.reduce((sum, i) => sum + Math.abs(i.sentiment_score || 0), 0) / interactions.length;
    
    // Normalize word count: 0 words = 0, 150+ words = 1.0
    const wordCountNorm = Math.min(avgWordCount / 150, 1.0);
    // Unique word ratio already 0-1
    const uniqueNorm = avgUniqueRatio;
    // Sentiment: engagement (either positive or negative) is depth signal
    const sentimentNorm = Math.min(avgSentiment * 5, 1.0);

    return (wordCountNorm * 0.5) + (uniqueNorm * 0.35) + (sentimentNorm * 0.15);
  })();

  // --- 25% RESPONSE LATENCY ---
  const latencyScore = (() => {
    const latencies = interactions
      .map(i => i.response_latency_ms || 0)
      .filter(l => l > 0);
    if (latencies.length === 0) return 0.3; // default partial credit
    const avgLatency = latencies.reduce((sum, l) => sum + l, 0) / latencies.length;
    // Under 2 min = excellent, over 30 min = poor
    if (avgLatency < 120000) return 1.0;
    if (avgLatency < 300000) return 0.8;
    if (avgLatency < 900000) return 0.6;
    if (avgLatency < 1800000) return 0.4;
    return 0.2;
  })();

  // Weighted composite
  const raw = (promptCompletionScore * 0.40) + (depthScore * 0.35) + (latencyScore * 0.25);

  // Scale by message count (more messages = higher potential)
  const messageMultiplier = Math.min(interactions.length / 8, 1.0);
  const scaled = raw * messageMultiplier;

  return Math.round(Math.min(scaled * 100, 100));
}

export function getResonanceState(score) {
  if (score >= 60) return 'resonating';
  if (score >= 25) return 'discovering';
  return 'locked';
}

export function getUnlockedFields(score) {
  return {
    name: score >= 25,
    interests: score >= 50,
    bio: score >= 75,
    photo: score >= 100
  };
}

export function getNextUnlock(score) {
  if (score < 25) return { field: 'name', threshold: 25 };
  if (score < 50) return { field: 'interests', threshold: 50 };
  if (score < 75) return { field: 'bio', threshold: 75 };
  if (score < 100) return { field: 'photo', threshold: 100 };
  return null;
}

export function renderSegmentedBar(score, total = 20) {
  const filled = Math.round((score / 100) * total);
  const empty = total - filled;
  return '#'.repeat(filled) + '-'.repeat(empty);
}

export function getStateColor(state) {
  if (state === 'resonating') return 'text-primary';
  if (state === 'discovering') return 'text-accent';
  return 'text-muted-foreground';
}

export function getScoreColor(score) {
  if (score >= 60) return 'hsl(258 90% 60%)';
  if (score >= 25) return 'hsl(320 85% 60%)';
  return 'hsl(230 15% 55%)';
}
