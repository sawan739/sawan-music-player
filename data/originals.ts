/**
 * "Sawan Originals" — fictional demo artists and albums whose audio is synthesised
 * by scripts/generate-demo-audio.ts. Every track here really plays (HTML5 Audio).
 */
import type { Album, Artist, ArtPattern, GenreId, MoodId, Palette, Track } from '@/types/music';
import durations from './originals-audio.json';

export const ORIGINAL_ARTISTS: Artist[] = [
  { id: 'og-sawan-and-the-clouds', name: 'Sawan & The Clouds', origin: 'original', genres: ['pop'], artwork: { palette: ['#5eead4', '#0ea5e9', '#1e1b4b'], pattern: 'rain', seed: 7 }, bio: 'The house band of Sawan Music. Bright, rain-soaked pop written for the first shower of the season — and for anyone who has ever danced in it.' },
  { id: 'og-neel-akash', name: 'Neel Akash', origin: 'original', genres: ['lofi'], artwork: { palette: ['#c4b5fd', '#6d28d9', '#140f33'], pattern: 'rain', seed: 19 }, bio: 'Bedroom producer making lo-fi for rainy evenings: dusty Rhodes chords, soft drums and the sound of the monsoon outside the window.' },
  { id: 'og-kaagaz-kites', name: 'Kaagaz Kites', origin: 'original', genres: ['electronic'], artwork: { palette: ['#22d3ee', '#c026d3', '#170a2e'], pattern: 'sun', seed: 31 }, bio: 'A synthwave duo soundtracking midnight highway drives with neon arpeggios and gated drums.' },
  { id: 'og-tara-and-the-tanpura', name: 'Tara & The Tanpura', origin: 'original', genres: ['fusion', 'folk'], artwork: { palette: ['#fde68a', '#d97706', '#3b0f07'], pattern: 'mandala', seed: 43 }, bio: 'Raga-inspired fusion built on a tanpura drone, tabla patterns and plucked melodies from the desert to the ghats.' },
  { id: 'og-midnight-chai', name: 'Midnight Chai', origin: 'original', genres: ['chillhop'], artwork: { palette: ['#fbcfe8', '#f472b6', '#3b0f5c'], pattern: 'waves', seed: 59 }, bio: 'Jazzy chillhop loops for slow mornings and golden-hour walks.' },
];

type OriginalSpec = { slug: string; title: string; moods: MoodId[] };
type AlbumSpec = {
  id: string; title: string; type: Album['type']; artistId: string; releaseDate: string; genre: GenreId;
  palette: Palette; pattern: ArtPattern; description: string; tracks: OriginalSpec[];
};

const ALBUM_SPECS: AlbumSpec[] = [
  {
    id: 'og-dil-ki-baarish', title: 'Dil Ki Baarish', type: 'EP', artistId: 'og-sawan-and-the-clouds', releaseDate: '2026-09-01', genre: 'pop',
    palette: ['#67e8f9', '#2563eb', '#1e1b4b'], pattern: 'rain',
    description: 'Two monsoon pop songs from the Sawan Music house band — rain intros, bright guitars and singalong hooks.',
    tracks: [
      { slug: 'dil-ki-baarish', title: 'Dil Ki Baarish', moods: ['monsoon', 'romance', 'party'] },
      { slug: 'baadal', title: 'Baadal', moods: ['monsoon', 'chill'] },
    ],
  },
  {
    id: 'og-monsoon-diaries', title: 'Monsoon Diaries', type: 'Album', artistId: 'og-neel-akash', releaseDate: '2026-07-14', genre: 'lofi',
    palette: ['#a78bfa', '#4c1d95', '#0b0a1f'], pattern: 'rain',
    description: 'Lo-fi beats recorded (well, synthesised) while it poured outside. Best with headphones and a window seat.',
    tracks: [
      { slug: 'first-rain', title: 'First Rain', moods: ['monsoon', 'chill', 'focus'] },
      { slug: 'chai-on-the-balcony', title: 'Chai on the Balcony', moods: ['chill', 'focus'] },
      { slug: 'wet-streets-warm-lights', title: 'Wet Streets, Warm Lights', moods: ['monsoon', 'heartbreak', 'focus'] },
    ],
  },
  {
    id: 'og-golden-hour', title: 'Golden Hour', type: 'EP', artistId: 'og-midnight-chai', releaseDate: '2026-05-18', genre: 'chillhop',
    palette: ['#fdba74', '#ec4899', '#3b0764'], pattern: 'waves',
    description: 'Warm chillhop for sunsets and slow mornings.',
    tracks: [
      { slug: 'golden-hour', title: 'Golden Hour', moods: ['chill', 'romance'] },
      { slug: 'slow-mornings', title: 'Slow Mornings', moods: ['chill', 'focus'] },
    ],
  },
  {
    id: 'og-midnight-highway', title: 'Midnight Highway', type: 'Album', artistId: 'og-kaagaz-kites', releaseDate: '2026-03-02', genre: 'electronic',
    palette: ['#f0abfc', '#7c3aed', '#0c0a2a'], pattern: 'sun',
    description: 'Synthwave for the ring road at 2 AM — neon arpeggios, pulsing bass and a sun that never quite sets.',
    tracks: [
      { slug: 'neon-dhaba', title: 'Neon Dhaba', moods: ['party', 'workout'] },
      { slug: 'ring-road-run', title: 'Ring Road Run', moods: ['workout', 'focus'] },
      { slug: 'afterglow', title: 'Afterglow', moods: ['chill', 'heartbreak'] },
    ],
  },
  {
    id: 'og-raag-reloaded', title: 'Raag Reloaded', type: 'Album', artistId: 'og-tara-and-the-tanpura', releaseDate: '2025-11-20', genre: 'fusion',
    palette: ['#fcd34d', '#c2410c', '#2a0a05'], pattern: 'mandala',
    description: 'A tanpura drone, teentaal on the tabla and plucked melodies in Bhairav and Hijaz.',
    tracks: [
      { slug: 'morning-bhairav', title: 'Morning Bhairav', moods: ['devotion', 'focus', 'chill'] },
      { slug: 'desert-caravan', title: 'Desert Caravan', moods: ['party', 'workout'] },
    ],
  },
];

const artistRef = (id: string) => {
  const a = ORIGINAL_ARTISTS.find(x => x.id === id)!;
  return { id: a.id, name: a.name };
};
const durationOf = (slug: string) => (durations as Record<string, number>)[slug] ?? null;

export const ORIGINAL_ALBUMS: Album[] = ALBUM_SPECS.map(spec => ({
  id: spec.id,
  title: spec.title,
  type: spec.type,
  artists: [artistRef(spec.artistId)],
  artwork: { palette: spec.palette, pattern: spec.pattern, seed: spec.id.length * 13 },
  releaseDate: spec.releaseDate,
  genre: spec.genre,
  language: 'instrumental',
  label: 'Sawan Originals',
  description: spec.description,
  trackIds: spec.tracks.map(t => `og-${t.slug}`),
}));

export const ORIGINAL_TRACKS: Track[] = ALBUM_SPECS.flatMap(spec =>
  spec.tracks.map(t => ({
    id: `og-${t.slug}`,
    title: t.title,
    artists: [artistRef(spec.artistId)],
    album: { id: spec.id, title: spec.title },
    artwork: { palette: spec.palette, pattern: spec.pattern, seed: spec.id.length * 13 },
    duration: durationOf(t.slug),
    genre: spec.genre === 'fusion' && t.slug === 'desert-caravan' ? 'folk' : spec.genre,
    language: 'instrumental' as const,
    moods: t.moods,
    releaseDate: spec.releaseDate,
    source: { kind: 'audio' as const, url: `/audio/originals/${t.slug}.mp3` },
  })),
);
