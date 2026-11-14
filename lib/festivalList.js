// Festival list (names, hooks, communities). Safe to import from client components:
// it holds no story text. Story and ritual text lives in lib/stories.js (server only).
// Festival list shown on the home screen.
// community: the tradition a festival belongs to (Hindu, Sikh, Jain, Buddhist, Christian, Muslim, Tribal and folk).
// freeStory: true marks the one story per community that is meant to stay free to read. It is a
// label only; the rule the paywall enforces lives in lib/access.js (FREE_STORY_IDS), and a test keeps the two in step.
export const festivals = [
  { id: "diwali", name: "Diwali", hook: "Why a whole country lights lamps on one night", meta: "5 regional stories · rituals", icon: "diya", community: "Hindu", freeStory: true, active: true },
  { id: "bhaidooj", name: "Bhai Dooj", hook: "The day Death himself got a sister's blessing", meta: "Diwali week · 4 regional names", icon: "tilak", community: "Hindu", active: true },
  { id: "holi", name: "Holi", hook: "One festival, five very different celebrations", meta: "5 regional stories · rituals", icon: "holi", community: "Hindu", active: true },
  { id: "teej", name: "Teej", hook: "A fast women choose, sing through, and dress up for", meta: "Sawan season · 3 variants", icon: "bangle", community: "Hindu", active: true },
  { id: "newyear", name: "The New Year Cluster", hook: "One spring moment, celebrated under eight different names", meta: "8 regions · rituals", icon: "sun", community: "Hindu", active: true },
  { id: "sankranti", name: "The Makar Sankranti Cluster", hook: "One sun, seven ways to say thank you for the harvest", meta: "7 regions · rituals", icon: "kite", community: "Hindu", active: true },
  { id: "chhath", name: "Chhath Puja", hook: "Four days, no water, and an offering to the setting sun", meta: "5 regional stories · rituals", icon: "sun", community: "Hindu", active: true },
  { id: "ganesh", name: "Ganesh Chaturthi", hook: "How a clay idol became a ten-day city festival", meta: "5 regional stories · rituals", icon: "steam", community: "Hindu", active: true },
  { id: "janmashtami", name: "Janmashtami", hook: "A midnight birth in a prison cell, and the pot of butter the next morning", meta: "5 regional stories · rituals", icon: "steam", community: "Hindu", active: true },
  { id: "shivratri", name: "Maha Shivratri", hook: "The great night of Shiva, kept awake in five very different places", meta: "5 regional stories · rituals", icon: "steam", community: "Hindu", active: true },
  { id: "rakshabandhan", name: "Raksha Bandhan", hook: "A thread, a promise, and the many ways India ties it", meta: "5 regional stories · rituals", icon: "tilak", community: "Hindu", active: true },
  { id: "karvachauth", name: "Karva Chauth", hook: "A day-long fast, a sieve, and a moon that keeps people waiting", meta: "5 regional stories · rituals", icon: "bangle", community: "Hindu", active: true },
  { id: "pongal", name: "Pongal", hook: "The pot that boils over, and the cattle who earned it", meta: "5 regional stories · rituals", icon: "sun", community: "Hindu", active: true },
  { id: "navratri", name: "Navratri & Dussehra", hook: "Nine nights, nine forms of the goddess", meta: "7 regional stories · rituals", icon: "diya", community: "Hindu", active: true },
  { id: "onam", name: "Onam", hook: "The king who comes home once a year", meta: "5 regional stories · rituals", icon: "steam", community: "Hindu", active: true },
  { id: "vaisakhi", name: "Vaisakhi", hook: "The day five volunteers stepped out of a tent and a new community was born", meta: "5 regional stories · rituals", icon: "sun", community: "Sikh", freeStory: true, active: true },
  { id: "mahavir", name: "Mahavir Jayanti", hook: "The birth of the last Tirthankara, and a day that asks for no harm to anyone", meta: "5 regional stories · rituals", icon: "sun", community: "Jain", freeStory: true, active: true },
  { id: "buddha", name: "Buddha Purnima", hook: "One full moon for a birth, an awakening and a farewell", meta: "5 regional stories · rituals", icon: "sun", community: "Buddhist", freeStory: true, active: true },
  { id: "christmas", name: "Christmas", hook: "Midnight Mass, a crib, a star and a feast, kept differently in every corner", meta: "5 regional stories · rituals", icon: "sun", community: "Christian", freeStory: true, active: true },
  { id: "eid", name: "Eid al-Fitr", hook: "A new moon, a month's fast ended, and a feast shared with the neighbours", meta: "5 regional stories · rituals", icon: "sun", community: "Muslim", freeStory: true, active: true },
  { id: "bihu", name: "Rongali (Bohag) Bihu", hook: "The Assamese new year that begins by washing the cattle, and goes on in song", meta: "7 regional stories · rituals", icon: "sun", community: "Tribal and folk", freeStory: true, active: true },
];
