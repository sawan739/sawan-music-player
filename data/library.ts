/**
 * The user's personal 235-song library (data/songs.json), streamed through the
 * YouTube engine. Genre/language/mood tags are best-effort, derived from the
 * primary artist and title keywords — edit the tables below to correct them.
 */
import type { Artist, GenreId, LanguageId, MoodId, Track } from '@/types/music';
import { GENRES } from './taxonomy';
import { hash, shiftPalette } from '@/utils/color';
import { slugify } from '@/utils/format';
import songs from './songs.json';

export type LibrarySong = { id: number; title: string; artist: string };
export const LIBRARY_SONGS: LibrarySong[] = songs;

const list = (s: string) => s.split('|').map(x => x.trim().toLowerCase());

const BY_ARTIST: [GenreId, LanguageId, string[]][] = [
  ['punjabi', 'punjabi', list('B Praak|AJAYVIR|Jassi Gill|Kulshan Sandhu|Amrinder Gill|Kamal Khan|Happy Raikoti|Sukha|Mankirt Aulakh|Raavi Gill|Sartaj Virk|Madhav Mahajan|Prem Dhillon|Jass Manak|Parmish Verma|Lakhwinder Wadali|AP Dhillon|Prabh Gill|Himmat Sandhu|Satinder Sartaaj|Garry Sandhu|Tedi Pagg|Jordan Sandhu|Shubh|Puran Sidhu|Varinder Brar|thiarajxtt|Karan Randhawa|Khan Bhaini|Arjun Sahota|Brham Darya|Harsh Nussi|Deep Fateh|Ninja|Karan Benipal|Armaan Gill|Rangle Sardar|Zeeshan Ali|Wavey|Amar Jalal|Hiten|Shahzad Santoo|Simran Choudhary|Tarna|Mauji|Honey Dhillon|Sandeep|Danny|Jaidev Kumar|Zain Zohaib|Krrishna Sharma')],
  ['hiphop', 'punjabi', list('Karan Aujla|Navaan Sandhu')],
  ['haryanvi', 'haryanvi', list('Filmy|Dhanda Nyoliwala|Masoom Sharma|Ndee Kundu|Champion|Irshad Khan|Ammy Choudhary|KD DESIROCK|Akki Aryan|Ashu Twinkle|Ammy Chahar|Sandeep Surila|Mr Dutt|Aakash bhati|AC|Keshav Tyohar|Arvind Jangid|Vnt Gaba|Mic Pe Vikram|Garry Sandhu x|Sick Vibex|Amber')],
  ['hiphop', 'haryanvi', list('MC Square|Vin WRLD')],
  ['hiphop', 'hindi', list('Krish Rao|Kushagra')],
  ['retro', 'hindi', list('K.K.|Kishore Kumar|Udit Narayan|Kumar Sanu|Atif Aslam|Himesh Reshammiya|Shankar Ehsaan Loy|Vishal Shekhar|Vishal & Shekhar|Sandesh Shandilya')],
  ['bollywood', 'hindi', list('Arijit Singh|Pritam|Sonu Nigam|Rahat Fateh Ali Khan|Sachet Tandon|Sachet-Parampara|Sachin-Jigar|A.R. Rahman|A. R. Rahman|Mohit Chauhan|Shankar Mahadevan|Javed Ali|Darshan Raval|Amit Trivedi|Tulsi Kumar|Vishal Mishra|Sanjay Leela Bhansali|Akashdeep Sengupta|Ayushmann Khurrana|Aparshakti Khurana|Meet Bros|Shahid Mallya|Paresh Pahuja|Shreyas Puranik|Soham Naik|Rochak Kohli|Garvit-Priyansh|Ali Saffudin|Vishal Pandey')],
  ['devotional', 'sanskrit', list('Religious India|Mahagatha|Armonian|Ketan Kumar|Siddharth Amit Bhavsar')],
  ['devotional', 'hindi', list('Vishal Chaturvedi|Koushik Mahata|Mohit Lalwani')],
  ['folk', 'rajasthani', list('Anupriya Lakhawat|Anuradha Paudwal|SP Jodha|Shyam Sidhawat|Kheta Khan|Sonu Kanwar|Various Artists|Jayraj Moyal')],
  ['international', 'english', list('WUYS|The Script|Yung Rare|Maan Panu')],
];

/** Per-song overrides where the artist alone is misleading. */
const OVERRIDES: Record<number, Partial<{ genre: GenreId; language: LanguageId }>> = {
  23: { genre: 'bollywood', language: 'hindi' }, 49: { genre: 'retro' }, 79: { language: 'south' }, 100: { genre: 'indie', language: 'south' },
  189: { genre: 'devotional', language: 'south' }, 218: { genre: 'bollywood', language: 'south' }, 120: { genre: 'devotional', language: 'sanskrit' },
  198: { genre: 'devotional', language: 'hindi' }, 192: { genre: 'indie', language: 'hindi' }, 137: { genre: 'punjabi', language: 'punjabi' },
  217: { genre: 'bollywood' }, 220: { genre: 'bollywood' }, 30: { genre: 'bollywood' }, 156: { genre: 'bollywood' },
};

const MOOD_WORDS: [MoodId, RegExp][] = [
  ['monsoon', /saawan|sawan|barsaat|barsat|baarish|rain|baadal|badal/i],
  ['romance', /ishq|pyar|pyaar|mohabbat|love|dil|sajna|maahi|heer|soniya|sohni|raanjh|ranjh|jaanu|tere|teri|tum |naina|nain|aankh|sohneya|you|gulab|mitwa|rasiya|zulf/i],
  ['heartbreak', /bewafa|tere bina|kaun hoyega|matlabi|nothing lasts|without you|i'm done|zehar|beqadar|judaa|mushkil|tasalli|unbothered|over and over|aahat/i],
  ['party', /party|gaddi|daru|birthday|bullet|college|top fella|8 asle|kaand|hood|weapon|level|dinosaur|moshi|montagem|gurgaon|naach|vip/i],
];

function classify(song: LibrarySong) {
  const primary = song.artist.split(',')[0].trim().toLowerCase();
  let genre: GenreId = 'indie';
  let language: LanguageId = 'hindi';
  for (const [g, l, names] of BY_ARTIST) {
    if (names.includes(primary)) { genre = g; language = l; break; }
  }
  const o = OVERRIDES[song.id];
  if (o?.genre) genre = o.genre;
  if (o?.language) language = o.language;

  const moods = new Set<MoodId>();
  for (const [mood, re] of MOOD_WORDS) if (re.test(song.title)) moods.add(mood);
  if (genre === 'devotional') moods.add('devotion');
  if (genre === 'haryanvi' || genre === 'hiphop') { moods.add('workout'); moods.add('party'); }
  if (genre === 'indie' || /acoustic|unplugged|slowed|lofi|jhankar/i.test(song.title)) moods.add('chill');
  if (genre === 'retro' || genre === 'bollywood') moods.add('romance');
  return { genre, language, moods: [...moods] };
}

export const libraryArtistId = (name: string) => `a-${slugify(name)}`;

export const LIBRARY_TRACKS: Track[] = LIBRARY_SONGS.map(song => {
  const { genre, language, moods } = classify(song);
  const seed = hash(song.id * 7919);
  const base = GENRES[genre];
  return {
    id: `yt-${song.id}`,
    title: song.title,
    artists: song.artist.split(',').map(n => n.trim()).filter(Boolean).map(name => ({ id: libraryArtistId(name), name })),
    artwork: { palette: shiftPalette(base.palette, (seed % 50) - 25), pattern: base.pattern, seed },
    duration: null,
    genre,
    language,
    moods,
    source: { kind: 'youtube', songId: song.id },
  };
});

export const LIBRARY_ARTISTS: Artist[] = (() => {
  const map = new Map<string, Artist & { count: number }>();
  for (const t of LIBRARY_TRACKS) {
    for (const ref of t.artists) {
      const existing = map.get(ref.id);
      if (existing) {
        existing.count++;
        if (!existing.genres.includes(t.genre)) existing.genres.push(t.genre);
        continue;
      }
      const seed = hash(ref.id);
      map.set(ref.id, {
        id: ref.id, name: ref.name, origin: 'library', genres: [t.genre], count: 1,
        artwork: { palette: shiftPalette(GENRES[t.genre].palette, (seed % 70) - 35), pattern: 'blob', seed },
      });
    }
  }
  return [...map.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name)).map(({ count: _count, ...a }) => a);
})();
