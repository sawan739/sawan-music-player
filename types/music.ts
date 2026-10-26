/** Shared domain types for the Sawan Music catalog, library and player. */

export type Palette = [string, string, string];

export type ArtPattern = 'waves' | 'rings' | 'rain' | 'sun' | 'grid' | 'blob' | 'mandala' | 'bars';

/**
 * Artwork is described, not stored: procedural cover art is rendered from a palette + pattern.
 * `url` is used instead when a real image exists (e.g. a YouTube thumbnail or provider artwork).
 */
export type Artwork = {
  palette: Palette;
  pattern: ArtPattern;
  seed: number;
  url?: string;
};

export type GenreId =
  | 'bollywood' | 'punjabi' | 'haryanvi' | 'hiphop' | 'devotional' | 'folk' | 'indie' | 'retro'
  | 'lofi' | 'electronic' | 'fusion' | 'pop' | 'chillhop' | 'international';
export type MoodId = 'romance' | 'party' | 'chill' | 'heartbreak' | 'monsoon' | 'devotion' | 'workout' | 'focus';
export type LanguageId = 'hindi' | 'punjabi' | 'haryanvi' | 'rajasthani' | 'sanskrit' | 'english' | 'south' | 'instrumental';

export type Facet = 'genre' | 'mood' | 'language';
export type FacetInfo = { id: string; facet: Facet; name: string; description: string; palette: Palette; pattern: ArtPattern };

/** Where the audio comes from. New providers add a new `kind` and a matching playback engine. */
export type TrackSource =
  | { kind: 'audio'; url: string }
  | { kind: 'youtube'; songId: number };

export type ArtistRef = { id: string; name: string };
export type AlbumRef = { id: string; title: string };

export type Track = {
  id: string;
  title: string;
  artists: ArtistRef[];
  album?: AlbumRef;
  artwork: Artwork;
  /** Seconds. `null` when only known after playback starts (YouTube). */
  duration: number | null;
  genre: GenreId;
  language: LanguageId;
  moods: MoodId[];
  releaseDate?: string;
  source: TrackSource;
};

export type Artist = {
  id: string;
  name: string;
  artwork: Artwork;
  genres: GenreId[];
  bio?: string;
  /** Originals are fictional demo acts with full profiles; library artists are real and only listed. */
  origin: 'original' | 'library';
};

export type AlbumType = 'Album' | 'EP' | 'Single';

export type Album = {
  id: string;
  title: string;
  type: AlbumType;
  artists: ArtistRef[];
  artwork: Artwork;
  releaseDate: string;
  genre: GenreId;
  language: LanguageId;
  label: string;
  description: string;
  trackIds: string[];
};

export type Playlist = {
  id: string;
  title: string;
  description: string;
  artwork: Artwork;
  trackIds: string[];
  tags: string[];
};

/** Lightweight snapshots stored in the user's library (localStorage). */
export type AlbumSummary = Pick<Album, 'id' | 'title' | 'type' | 'artists' | 'artwork' | 'releaseDate'>;
export type ArtistSummary = Pick<Artist, 'id' | 'name' | 'artwork'>;
export type PlaylistSummary = Pick<Playlist, 'id' | 'title' | 'description' | 'artwork'> & { trackCount: number };

export type UserPlaylist = {
  id: string;
  name: string;
  description: string;
  tracks: Track[];
  palette: Palette;
  createdAt: number;
  updatedAt: number;
};

export type PlayContext = { label: string; href?: string };
