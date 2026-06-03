// Mock User Seeder — generates 8-10 mock profiles + interactions at varying ResonanceScore levels

export const MOCK_PROFILES = [
  {
    id: 'mock_01',
    handle: 'SIGNAL_42',
    display_name: 'Mara Chen',
    bio: 'Ex-neuroscientist turned urban farmer. I traded microscopes for mycology and never looked back. Currently growing 14 varieties of mushrooms in a converted warehouse.',
    interests: ['mycology', 'neuroscience', 'urban farming', 'fermentation', 'octopus cognition'],
    photo_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80',
    tag_cloud: ['science', 'nature', 'systems', 'future'],
    resonance_score: 0,
    mock_id: 'mock_01',
    is_mock: true
  },
  {
    id: 'mock_02',
    handle: 'VOID_WALKER',
    display_name: 'James Okafor',
    bio: 'Architect by training, philosopher by obsession. I design spaces that make people feel small in the best possible way. Currently obsessed with the acoustics of brutalist structures.',
    interests: ['architecture', 'philosophy', 'acoustics', 'brutalism', 'spatial theory'],
    photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
    tag_cloud: ['design', 'philosophy', 'urbanism', 'culture'],
    resonance_score: 28,
    mock_id: 'mock_02',
    is_mock: true
  },
  {
    id: 'mock_03',
    handle: 'ECHO_DEPTH',
    display_name: 'Valentina Reyes',
    bio: 'I write software during the day and speculative fiction at night. Currently working on a novel set in a world where memory is a tradeable commodity. Yes, that means what you think it means.',
    interests: ['speculative fiction', 'software', 'cognitive science', 'semiotics', 'dark ecology'],
    photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80',
    tag_cloud: ['tech', 'writing', 'science', 'future'],
    resonance_score: 55,
    mock_id: 'mock_03',
    is_mock: true
  },
  {
    id: 'mock_04',
    handle: 'STATIC_MIND',
    display_name: 'Elias Brandt',
    bio: 'Jazz musician who became a data scientist. I believe chord progressions and machine learning are solving the same underlying problem. Most people think I\'m joking.',
    interests: ['jazz', 'machine learning', 'music theory', 'improvisation', 'pattern recognition'],
    photo_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80',
    tag_cloud: ['music', 'tech', 'art', 'systems'],
    resonance_score: 78,
    mock_id: 'mock_04',
    is_mock: true
  },
  {
    id: 'mock_05',
    handle: 'DEEP_FREQ',
    display_name: 'Nadia Volkov',
    bio: 'Marine biologist who studies bioluminescent organisms. I spend 6 months a year at sea, which means I\'ve learned to hold very long conversations with the ocean.',
    interests: ['marine biology', 'bioluminescence', 'oceanography', 'isolation', 'navigation'],
    photo_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80',
    tag_cloud: ['science', 'nature', 'philosophy', 'adventure'],
    resonance_score: 100,
    mock_id: 'mock_05',
    is_mock: true
  },
  {
    id: 'mock_06',
    handle: 'NULL_POINT',
    display_name: 'Theo Baptiste',
    bio: 'Documentary filmmaker obsessed with systems of control — food, finance, fashion. Currently in post-production on a film about the global vanilla trade and why it\'s deeply weird.',
    interests: ['documentary', 'systems theory', 'food politics', 'visual journalism', 'supply chains'],
    photo_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80',
    tag_cloud: ['film', 'politics', 'economics', 'culture'],
    resonance_score: 38,
    mock_id: 'mock_06',
    is_mock: true
  },
  {
    id: 'mock_07',
    handle: 'PHASE_LOCK',
    display_name: 'Ingrid Larsen',
    bio: 'I teach philosophy of mind to undergrads and secretly believe consciousness is a problem we\'re not equipped to solve. Also, I make extremely good bread.',
    interests: ['philosophy of mind', 'consciousness studies', 'phenomenology', 'breadmaking', 'Wittgenstein'],
    photo_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80',
    tag_cloud: ['philosophy', 'science', 'food', 'academia'],
    resonance_score: 62,
    mock_id: 'mock_07',
    is_mock: true
  },
  {
    id: 'mock_08',
    handle: 'CARRIER_WV',
    display_name: 'Omar Aziz',
    bio: 'Ex-foreign correspondent, current novelist. I\'ve reported from 40 countries, which has given me the ability to be wrong about almost anything with complete confidence.',
    interests: ['journalism', 'fiction', 'geopolitics', 'linguistics', 'moral philosophy'],
    photo_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80',
    tag_cloud: ['writing', 'politics', 'history', 'language'],
    resonance_score: 15,
    mock_id: 'mock_08',
    is_mock: true
  },
  {
    id: 'mock_09',
    handle: 'QUANTA_RY',
    display_name: 'Suki Yamamoto',
    bio: 'Quantum computing researcher who moonlights as a competitive Go player. The overlap is not as small as you\'d think.',
    interests: ['quantum computing', 'Go', 'game theory', 'mathematics', 'meditation'],
    photo_url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&q=80',
    tag_cloud: ['tech', 'strategy', 'science', 'philosophy'],
    resonance_score: 90,
    mock_id: 'mock_09',
    is_mock: true
  },
  {
    id: 'mock_10',
    handle: 'FRINGE_OP',
    display_name: 'Luca Ferrara',
    bio: 'I restore antique scientific instruments for a living. I find forgotten precision more interesting than new precision. There\'s a metaphor in there I\'m still unpacking.',
    interests: ['scientific history', 'restoration', 'craftsmanship', 'optics', 'epistemology'],
    photo_url: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=400&q=80',
    tag_cloud: ['history', 'craft', 'science', 'philosophy'],
    resonance_score: 45,
    mock_id: 'mock_10',
    is_mock: true
  }
];

export const MOCK_THREADS = [
  {
    id: 'mthread_01',
    creator_id: 'mock_01',
    creator_handle: 'SIGNAL_42',
    prompt_id: 'p001',
    prompt_text: 'What is the most "human" thing an AI will never understand?',
    topic_tags: ['philosophy', 'tech', 'consciousness'],
    status: 'void',
    resonance_state: 'locked',
    resonance_score: 0,
    is_mock: true
  },
  {
    id: 'mthread_02',
    creator_id: 'mock_02',
    creator_handle: 'VOID_WALKER',
    prompt_id: 'p007',
    prompt_text: 'Write the opening sentence of the novel that should exist but doesn\'t.',
    topic_tags: ['writing', 'fiction', 'creativity'],
    status: 'void',
    resonance_state: 'locked',
    resonance_score: 0,
    is_mock: true
  },
  {
    id: 'mthread_03',
    creator_id: 'mock_06',
    creator_handle: 'NULL_POINT',
    prompt_id: 'p022',
    prompt_text: 'What industry deserves to collapse but is being kept alive artificially, and by what?',
    topic_tags: ['economics', 'politics', 'systems'],
    status: 'void',
    resonance_state: 'locked',
    resonance_score: 0,
    is_mock: true
  },
  {
    id: 'mthread_04',
    creator_id: 'mock_08',
    creator_handle: 'CARRIER_WV',
    prompt_id: 'p030',
    prompt_text: 'What do you want to have made, said, or done that would justify having been here?',
    topic_tags: ['legacy', 'purpose', 'meaning'],
    status: 'void',
    resonance_state: 'locked',
    resonance_score: 0,
    is_mock: true
  }
];

export function getMockProfile(mockId) {
  return MOCK_PROFILES.find(p => p.mock_id === mockId);
}

export function generateMockInteractionsForScore(targetScore, threadId, senderId, receiverId) {
  // Generate interactions that would produce approximately the target score
  const count = targetScore > 60 ? 10 : targetScore > 25 ? 6 : 3;
  const interactions = [];
  const now = Date.now();

  for (let i = 0; i < count; i++) {
    const isEvenTurn = i % 2 === 0;
    const wordCount = targetScore > 60 ? 80 + Math.random() * 60 : 
                      targetScore > 25 ? 40 + Math.random() * 40 : 
                      10 + Math.random() * 20;
    
    interactions.push({
      id: `mock_int_${threadId}_${i}`,
      thread_id: threadId,
      sender_id: isEvenTurn ? senderId : receiverId,
      sender_handle: isEvenTurn ? 'YOU' : 'THEM',
      content: generateMockContent(Math.round(wordCount)),
      word_count: Math.round(wordCount),
      unique_word_ratio: 0.6 + Math.random() * 0.3,
      sentiment_score: (Math.random() - 0.3) * 0.5,
      prompt_completed: targetScore > 15,
      response_latency_ms: targetScore > 60 ? 60000 + Math.random() * 120000 : 300000 + Math.random() * 600000,
      created_date: new Date(now - (count - i) * 180000).toISOString(),
      is_mock: true
    });
  }

  return interactions;
}

function generateMockContent(wordCount) {
  const fragments = [
    'The interesting thing about this question is that it forces you to confront',
    'I think the answer depends entirely on how you define',
    'What strikes me is the implicit assumption that',
    'There\'s a deeper layer here that most people miss, which is',
    'I\'ve been thinking about this for a while and I keep coming back to',
    'The conventional answer is obvious, but what I find more compelling is',
    'Something I noticed recently that connects to this is',
    'The honest answer, which I rarely say out loud, is that',
    'What you\'re really asking is whether we believe',
    'The thing nobody wants to acknowledge is that'
  ];
  
  const filler = [
    'the underlying systems that govern how we interpret meaning',
    'the relationship between structure and emergence',
    'what it means to experience something authentically',
    'the gap between what we say and what we actually believe',
    'how context shapes everything we think we understand',
    'the recursive nature of self-awareness and its limits',
    'the way language both enables and constrains thought',
    'the friction between individual experience and collective narrative'
  ];

  const base = fragments[Math.floor(Math.random() * fragments.length)];
  const fill = filler[Math.floor(Math.random() * filler.length)];
  const text = `${base} ${fill}.`;
  
  // Repeat to reach approximate word count
  const targetWords = wordCount;
  let result = text;
  while (result.split(' ').length < targetWords) {
    result += ' ' + filler[Math.floor(Math.random() * filler.length)] + '.';
  }
  
  return result.split(' ').slice(0, targetWords).join(' ');
}