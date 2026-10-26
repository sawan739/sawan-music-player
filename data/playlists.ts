import type { ArtPattern, Palette, Playlist, Track } from '@/types/music';

type Rule = (t: Track) => boolean;
type PlaylistSpec = { id: string; title: string; description: string; palette: Palette; pattern: ArtPattern; tags: string[]; rule?: Rule; ids?: string[]; limit?: number };

const yt = (...ids: number[]) => ids.map(id => `yt-${id}`);
const isOriginal: Rule = t => t.source.kind === 'audio';

const SPECS: PlaylistSpec[] = [
  { id: 'sawan-originals', title: 'Sawan Originals', description: 'Every original on Sawan Music — lo-fi, synthwave, fusion and monsoon pop. Plays instantly, no setup needed.', palette: ['#5eead4', '#8b5cf6', '#1e1b4b'], pattern: 'rain', tags: ['originals'], rule: isOriginal },
  { id: 'sawan-special', title: 'Sawan Special', description: 'Rain songs and monsoon romance for grey skies and wet streets.', palette: ['#67e8f9', '#0284c7', '#082f49'], pattern: 'rain', tags: ['monsoon'], rule: t => t.moods.includes('monsoon'), ids: yt(21, 104, 101, 33, 90, 41, 190, 175, 7, 29) },
  { id: 'punjabi-power', title: 'Punjabi Power', description: 'The biggest Punjabi bangers and heart-melters in your collection.', palette: ['#fcd34d', '#f97316', '#7c0a02'], pattern: 'bars', tags: ['punjabi'], rule: t => t.language === 'punjabi', limit: 60 },
  { id: 'haryanvi-hitlist', title: 'Haryanvi Hitlist', description: 'Desi swag from Haryana, loud and proud.', palette: ['#fb923c', '#e11d48', '#3d0066'], pattern: 'grid', tags: ['haryanvi'], rule: t => t.language === 'haryanvi' },
  { id: 'bollywood-romance', title: 'Bollywood Romance', description: 'Arijit, Shreya, Pritam and the soundtrack of every love story.', palette: ['#fda4af', '#db2777', '#3b0618'], pattern: 'blob', tags: ['bollywood', 'romance'], rule: t => t.genre === 'bollywood' },
  { id: 'retro-gold', title: 'Retro Gold', description: 'Kishore, Udit, Kumar Sanu, K.K. — timeless voices, timeless songs.', palette: ['#fde68a', '#b45309', '#2a1406'], pattern: 'rings', tags: ['retro'], rule: t => t.genre === 'retro' },
  { id: 'bhakti-sandhya', title: 'Bhakti Sandhya', description: 'Mantras, stutis and bhajans for a peaceful evening.', palette: ['#fef08a', '#ea580c', '#4a1206'], pattern: 'mandala', tags: ['devotional'], rule: t => t.genre === 'devotional' || t.id === 'og-morning-bhairav' },
  { id: 'rajasthani-rang', title: 'Rajasthani Rang', description: 'Ghoomar, gangaur and desert ballads.', palette: ['#fdba74', '#c2410c', '#4a044e'], pattern: 'sun', tags: ['folk'], rule: t => t.genre === 'folk' },
  { id: 'indie-chai', title: 'Indie Chai', description: 'Independent artists and lo-fi warmth. Best with a cutting chai.', palette: ['#a5f3fc', '#6366f1', '#1e1b4b'], pattern: 'waves', tags: ['indie', 'chill'], rule: t => t.genre === 'indie' || t.genre === 'lofi' || t.genre === 'chillhop' },
  { id: 'beast-mode', title: 'Beast Mode', description: 'Haryanvi heat, Punjabi drill and synthwave to power every rep.', palette: ['#fca5a5', '#dc2626', '#1c1917'], pattern: 'grid', tags: ['workout'], rule: t => t.moods.includes('workout'), limit: 50 },
  { id: 'dil-toota', title: 'Dil Toota', description: 'For the nights that feel a little too long.', palette: ['#c7d2fe', '#475569', '#0f172a'], pattern: 'rain', tags: ['heartbreak'], rule: t => t.moods.includes('heartbreak') },
  { id: 'focus-flow', title: 'Focus Flow', description: 'Instrumental originals to get deep work done.', palette: ['#bef264', '#0d9488', '#042f2e'], pattern: 'rings', tags: ['focus'], rule: t => isOriginal(t) && t.moods.includes('focus') },
];

export function buildPlaylists(tracks: Track[]): Playlist[] {
  return SPECS.map(spec => {
    const ids = new Set(spec.ids ?? []);
    if (spec.rule) for (const t of tracks) if (spec.rule(t)) ids.add(t.id);
    const known = new Set(tracks.map(t => t.id));
    const trackIds = [...ids].filter(id => known.has(id)).slice(0, spec.limit ?? Infinity);
    return {
      id: spec.id, title: spec.title, description: spec.description, tags: spec.tags, trackIds,
      artwork: { palette: spec.palette, pattern: spec.pattern, seed: spec.id.length * 31 },
    };
  });
}
