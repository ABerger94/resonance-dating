// PromptEngine — curated library of high-concept challenges

export const PROMPTS = [
  {
    id: 'p001',
    category: 'PHILOSOPHY',
    text: 'What is the most "human" thing an AI will never understand?',
    tags: ['philosophy', 'tech', 'consciousness']
  },
  {
    id: 'p002',
    category: 'CINEMA',
    text: 'Build a 60-second pitch for why a film you love is the most important movie ever made.',
    tags: ['film', 'culture', 'rhetoric']
  },
  {
    id: 'p003',
    category: 'RETROSPECTIVE',
    text: 'Describe your worst day in the last year as if it were a 1-star Yelp review.',
    tags: ['humor', 'vulnerability', 'writing']
  },
  {
    id: 'p004',
    category: 'FUTURES',
    text: 'In 2050, what human ritual will feel as strange as bloodletting does today?',
    tags: ['future', 'society', 'history']
  },
  {
    id: 'p005',
    category: 'SELF-AUDIT',
    text: 'Name the belief you hold most confidently that you are least able to prove.',
    tags: ['philosophy', 'self', 'epistemology']
  },
  {
    id: 'p006',
    category: 'DESIGN',
    text: 'You have 3 minutes to redesign traffic lights. Go.',
    tags: ['design', 'systems', 'creativity']
  },
  {
    id: 'p007',
    category: 'LITERATURE',
    text: 'Write the opening sentence of the novel that should exist but doesn\'t.',
    tags: ['writing', 'fiction', 'creativity']
  },
  {
    id: 'p008',
    category: 'ECONOMICS',
    text: 'What would society look like if boredom were taxed?',
    tags: ['economics', 'society', 'thought-experiment']
  },
  {
    id: 'p009',
    category: 'MEMORY',
    text: 'Describe a moment from your past that your brain has clearly edited. What do you suspect it changed?',
    tags: ['memory', 'psychology', 'vulnerability']
  },
  {
    id: 'p010',
    category: 'ETHICS',
    text: 'You can delete one law. Not propose a replacement — just delete it. Which and why?',
    tags: ['ethics', 'law', 'politics']
  },
  {
    id: 'p011',
    category: 'LINGUISTICS',
    text: 'What English word should cease to exist, and what exact experience does it prevent you from expressing?',
    tags: ['language', 'linguistics', 'philosophy']
  },
  {
    id: 'p012',
    category: 'TECHNOLOGY',
    text: 'The internet disappears for 90 days globally. What is the second-order consequence no one is talking about?',
    tags: ['tech', 'society', 'systems']
  },
  {
    id: 'p013',
    category: 'ART',
    text: 'Describe a piece of music that changed your internal chemistry. Not your favorite — the one that shifted something.',
    tags: ['music', 'emotion', 'art']
  },
  {
    id: 'p014',
    category: 'IDENTITY',
    text: 'What version of yourself do you perform at work that would be unrecognizable to a childhood friend?',
    tags: ['identity', 'psychology', 'self']
  },
  {
    id: 'p015',
    category: 'SCIENCE',
    text: 'Pick a scientific consensus you privately find unsatisfying, even if you accept it as true.',
    tags: ['science', 'epistemology', 'critical-thinking']
  },
  {
    id: 'p016',
    category: 'URBANISM',
    text: 'Design the public space that your city desperately needs but will never build.',
    tags: ['design', 'urbanism', 'society']
  },
  {
    id: 'p017',
    category: 'CONFLICT',
    text: 'Describe a hill you are willing to die on that most people would consider completely unreasonable.',
    tags: ['opinion', 'values', 'humor']
  },
  {
    id: 'p018',
    category: 'TIME',
    text: 'If you had to bet your life savings on a single prediction about 2040, what\'s your wager?',
    tags: ['future', 'prediction', 'risk']
  },
  {
    id: 'p019',
    category: 'CRAFT',
    text: 'Describe the thing you\'re learning right now that makes you feel like a beginner again.',
    tags: ['growth', 'skills', 'humility']
  },
  {
    id: 'p020',
    category: 'MYTHOLOGY',
    text: 'Modern life desperately needs a new myth. Propose it in two sentences.',
    tags: ['mythology', 'culture', 'storytelling']
  },
  {
    id: 'p021',
    category: 'SPACE',
    text: 'Humanity gets one message to transmit into deep space. 140 characters. Write it.',
    tags: ['space', 'philosophy', 'humanity']
  },
  {
    id: 'p022',
    category: 'ECONOMICS',
    text: 'What industry deserves to collapse but is being kept alive artificially, and by what?',
    tags: ['economics', 'politics', 'systems']
  },
  {
    id: 'p023',
    category: 'CHILDHOOD',
    text: 'What did you believe as a child that turned out to be more true than adults told you?',
    tags: ['childhood', 'wisdom', 'perspective']
  },
  {
    id: 'p024',
    category: 'ARCHITECTURE',
    text: 'You inherit a brutalist concrete building. What do you do with it?',
    tags: ['architecture', 'design', 'values']
  },
  {
    id: 'p025',
    category: 'LANGUAGE',
    text: 'Coin a word for an emotion that exists in your life but has no name in any language.',
    tags: ['language', 'creativity', 'emotion']
  },
  {
    id: 'p026',
    category: 'MORALITY',
    text: 'At what income level does a person become morally obligated to redistribute wealth?',
    tags: ['ethics', 'economics', 'morality']
  },
  {
    id: 'p027',
    category: 'NATURE',
    text: 'Pick an animal whose cognitive experience you would trade for yours for 24 hours, and explain the trade.',
    tags: ['nature', 'philosophy', 'imagination']
  },
  {
    id: 'p028',
    category: 'MEDIA',
    text: 'What piece of media (book/film/song/game) should come with a warning label, and what would it say?',
    tags: ['media', 'culture', 'criticism']
  },
  {
    id: 'p029',
    category: 'SYSTEMS',
    text: 'Which broken system are you most complicit in perpetuating through your daily choices?',
    tags: ['ethics', 'self', 'systems']
  },
  {
    id: 'p030',
    category: 'LEGACY',
    text: 'What do you want to have made, said, or done that would justify having been here?',
    tags: ['legacy', 'purpose', 'meaning']
  }
];

export function getPromptById(id) {
  return PROMPTS.find(p => p.id === id) || PROMPTS[0];
}

export function getRandomPrompt() {
  return PROMPTS[Math.floor(Math.random() * PROMPTS.length)];
}

export function getPromptsByTag(tag) {
  return PROMPTS.filter(p => p.tags.includes(tag));
}

export function getAllTags() {
  const tags = new Set();
  PROMPTS.forEach(p => p.tags.forEach(t => tags.add(t)));
  return [...tags].sort();
}