import type { FacetInfo, GenreId, LanguageId, MoodId } from '@/types/music';

export const GENRES: Record<GenreId, FacetInfo> = {
  bollywood: { id: 'bollywood', facet: 'genre', name: 'Bollywood', description: 'Film songs that defined every mood.', palette: ['#ff6a88', '#b5179e', '#2b0a5c'], pattern: 'rings' },
  punjabi: { id: 'punjabi', facet: 'genre', name: 'Punjabi', description: 'Dhol, swagger and soulful Punjabi melodies.', palette: ['#fcd34d', '#f3722c', '#7c0a02'], pattern: 'bars' },
  haryanvi: { id: 'haryanvi', facet: 'genre', name: 'Haryanvi', description: 'Desi beats straight from Haryana.', palette: ['#ff9e00', '#ff006e', '#3d0066'], pattern: 'grid' },
  hiphop: { id: 'hiphop', facet: 'genre', name: 'Desi Hip-Hop', description: 'Bars, drill and street anthems.', palette: ['#a3e635', '#0f9b8e', '#06302e'], pattern: 'bars' },
  devotional: { id: 'devotional', facet: 'genre', name: 'Devotional', description: 'Mantras, stutis and bhajans.', palette: ['#fde68a', '#f77f00', '#6b1d0b'], pattern: 'mandala' },
  folk: { id: 'folk', facet: 'genre', name: 'Rajasthani Folk', description: 'Desert winds, ghoomar and folk tales.', palette: ['#f4a261', '#e76f51', '#4c1d6b'], pattern: 'sun' },
  indie: { id: 'indie', facet: 'genre', name: 'Indie', description: 'Independent voices and bedroom anthems.', palette: ['#89f7fe', '#66a6ff', '#2e2378'], pattern: 'waves' },
  retro: { id: 'retro', facet: 'genre', name: 'Retro', description: 'Golden-era classics that never get old.', palette: ['#fcd34d', '#c2410c', '#3f1d0b'], pattern: 'rings' },
  lofi: { id: 'lofi', facet: 'genre', name: 'Lo-fi', description: 'Dusty keys, soft drums and rain.', palette: ['#c4b5fd', '#6d28d9', '#1e1b4b'], pattern: 'rain' },
  electronic: { id: 'electronic', facet: 'genre', name: 'Electronic', description: 'Synths, neon and night drives.', palette: ['#22d3ee', '#a21caf', '#1e0b3b'], pattern: 'sun' },
  fusion: { id: 'fusion', facet: 'genre', name: 'Indian Fusion', description: 'Ragas meet modern production.', palette: ['#fde68a', '#d97706', '#45160a'], pattern: 'mandala' },
  pop: { id: 'pop', facet: 'genre', name: 'Pop', description: 'Big hooks, bright choruses.', palette: ['#5eead4', '#3b82f6', '#2a2575'], pattern: 'blob' },
  chillhop: { id: 'chillhop', facet: 'genre', name: 'Chillhop', description: 'Jazzy loops for slow afternoons.', palette: ['#fbcfe8', '#f472b6', '#43176b'], pattern: 'waves' },
  international: { id: 'international', facet: 'genre', name: 'International', description: 'Global sounds in your rotation.', palette: ['#7dd3fc', '#6366f1', '#111827'], pattern: 'grid' },
};

export const MOODS: Record<MoodId, FacetInfo> = {
  romance: { id: 'romance', facet: 'mood', name: 'Romance', description: 'Songs for the one on your mind.', palette: ['#fb7185', '#be185d', '#3b0618'], pattern: 'blob' },
  party: { id: 'party', facet: 'mood', name: 'Party', description: 'Turn it up. All the way.', palette: ['#facc15', '#ec4899', '#3b1470'], pattern: 'bars' },
  chill: { id: 'chill', facet: 'mood', name: 'Chill', description: 'Unwind, breathe, slow down.', palette: ['#67e8f9', '#3b82f6', '#1e1b4b'], pattern: 'waves' },
  heartbreak: { id: 'heartbreak', facet: 'mood', name: 'Heartbreak', description: 'For the nights that feel too long.', palette: ['#a5b4fc', '#475569', '#0f172a'], pattern: 'rain' },
  monsoon: { id: 'monsoon', facet: 'mood', name: 'Monsoon', description: 'Rain on the window, music in the air.', palette: ['#5eead4', '#0ea5e9', '#082f49'], pattern: 'rain' },
  devotion: { id: 'devotion', facet: 'mood', name: 'Devotion', description: 'Peace, prayer and calm.', palette: ['#fde047', '#f97316', '#6b1f0a'], pattern: 'mandala' },
  workout: { id: 'workout', facet: 'mood', name: 'Workout', description: 'High-energy fuel for every rep.', palette: ['#f87171', '#dc2626', '#1c1917'], pattern: 'grid' },
  focus: { id: 'focus', facet: 'mood', name: 'Focus', description: 'Instrumentals to get in the zone.', palette: ['#bef264', '#14b8a6', '#042f2e'], pattern: 'rings' },
};

export const LANGUAGES: Record<LanguageId, FacetInfo> = {
  hindi: { id: 'hindi', facet: 'language', name: 'Hindi', description: 'Hindi hits and soulful melodies.', palette: ['#fda4af', '#e11d48', '#3f0a1d'], pattern: 'rings' },
  punjabi: { id: 'punjabi', facet: 'language', name: 'Punjabi', description: 'Punjabi music for every occasion.', palette: ['#fcd34d', '#ea580c', '#431407'], pattern: 'bars' },
  haryanvi: { id: 'haryanvi', facet: 'language', name: 'Haryanvi', description: 'Songs in Haryanvi.', palette: ['#fdba74', '#db2777', '#3b0764'], pattern: 'grid' },
  rajasthani: { id: 'rajasthani', facet: 'language', name: 'Rajasthani', description: 'Folk songs from Rajasthan.', palette: ['#fed7aa', '#c2410c', '#4a044e'], pattern: 'sun' },
  sanskrit: { id: 'sanskrit', facet: 'language', name: 'Sanskrit', description: 'Mantras and stotrams.', palette: ['#fef08a', '#d97706', '#451a03'], pattern: 'mandala' },
  english: { id: 'english', facet: 'language', name: 'English', description: 'English-language tracks.', palette: ['#bae6fd', '#4f46e5', '#0f172a'], pattern: 'grid' },
  south: { id: 'south', facet: 'language', name: 'South Indian', description: 'Tamil, Telugu and Kannada songs.', palette: ['#86efac', '#059669', '#052e16'], pattern: 'waves' },
  instrumental: { id: 'instrumental', facet: 'language', name: 'Instrumental', description: 'No words needed.', palette: ['#a5f3fc', '#8b5cf6', '#1e1b4b'], pattern: 'waves' },
};

export const FACETS = { genre: GENRES, mood: MOODS, language: LANGUAGES } as const;
