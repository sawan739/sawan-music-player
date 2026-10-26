import type { Album, Artist, Facet, FacetInfo, Playlist, Track } from '@/types/music';
import type { MusicCatalog, SearchResults } from './types';
import { ORIGINAL_ALBUMS, ORIGINAL_ARTISTS, ORIGINAL_TRACKS } from '@/data/originals';
import { LIBRARY_ARTISTS, LIBRARY_TRACKS } from '@/data/library';
import { buildPlaylists } from '@/data/playlists';
import { FACETS } from '@/data/taxonomy';

const TRACKS: Track[] = [...ORIGINAL_TRACKS, ...LIBRARY_TRACKS];
const ARTISTS: Artist[] = [...ORIGINAL_ARTISTS, ...LIBRARY_ARTISTS];
const ALBUMS: Album[] = [...ORIGINAL_ALBUMS].sort((a, b) => b.releaseDate.localeCompare(a.releaseDate));
const PLAYLISTS: Playlist[] = buildPlaylists(TRACKS);

const trackById = new Map(TRACKS.map(t => [t.id, t]));
const artistById = new Map(ARTISTS.map(a => [a.id, a]));
const albumById = new Map(ALBUMS.map(a => [a.id, a]));
const playlistById = new Map(PLAYLISTS.map(p => [p.id, p]));
const tracksOf = (ids: string[]) => ids.map(id => trackById.get(id)).filter((t): t is Track => !!t);
const byArtist = (artistId: string) => TRACKS.filter(t => t.artists.some(a => a.id === artistId));

/** Hand-picked "trending" rotation for the demo home feed. */
const TRENDING = ['og-dil-ki-baarish', 'yt-7', 'yt-37', 'yt-86', 'yt-4', 'og-neon-dhaba', 'yt-29', 'yt-47', 'yt-163', 'yt-132', 'og-first-rain', 'yt-59', 'yt-1', 'yt-142', 'yt-209', 'yt-176'];

const normalise = (s: string) => s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();

function score(text: string, query: string, tokens: string[]) {
  const n = normalise(text);
  if (!tokens.every(t => n.includes(t))) return 0;
  if (n === query) return 100;
  if (n.startsWith(query)) return 80;
  if (n.split(' ').some(w => w.startsWith(tokens[0]))) return 50;
  return 20;
}

function rank<T>(items: T[], text: (item: T) => string, query: string, tokens: string[], limit: number) {
  return items
    .map(item => ({ item, s: score(text(item), query, tokens) }))
    .filter(x => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, limit)
    .map(x => x.item);
}

// Simulates network latency so skeleton states are exercised in development.
const latency = <T>(value: T, ms = 120) => new Promise<T>(resolve => setTimeout(() => resolve(value), process.env.NODE_ENV === 'development' ? ms : 0));

export const localCatalog: MusicCatalog = {
  async getHome() {
    const p = (id: string) => playlistById.get(id)!;
    return latency({
      featured: [
        { kind: 'album' as const, item: albumById.get('og-dil-ki-baarish')! },
        { kind: 'playlist' as const, item: p('sawan-special') },
        { kind: 'album' as const, item: albumById.get('og-midnight-highway')! },
        { kind: 'playlist' as const, item: p('punjabi-power') },
        { kind: 'album' as const, item: albumById.get('og-raag-reloaded')! },
      ],
      trending: tracksOf(TRENDING),
      newReleases: ALBUMS,
      originals: ORIGINAL_TRACKS,
      artists: [...ORIGINAL_ARTISTS.slice(0, 2), ...LIBRARY_ARTISTS.slice(0, 14)],
      playlists: PLAYLISTS.filter(pl => pl.id !== 'sawan-originals'),
      monsoon: tracksOf(p('sawan-special').trackIds).slice(0, 14),
    });
  },
  async getTrack(id) {
    return trackById.get(id) ?? null;
  },
  async getAlbum(id) {
    const album = albumById.get(id);
    if (!album) return null;
    const moreByArtist = ALBUMS.filter(a => a.id !== id && a.artists.some(x => album.artists.some(y => y.id === x.id)));
    return latency({ album, tracks: tracksOf(album.trackIds), moreByArtist: moreByArtist.length ? moreByArtist : ALBUMS.filter(a => a.id !== id) });
  },
  async getArtist(id) {
    const artist = artistById.get(id);
    if (!artist) return null;
    const tracks = byArtist(id);
    const trackIds = new Set(tracks.map(t => t.id));
    const albums = ALBUMS.filter(a => a.artists.some(x => x.id === id));
    const playlists = PLAYLISTS.filter(pl => pl.trackIds.some(t => trackIds.has(t)));
    const related = ARTISTS.filter(a => a.id !== id && a.genres.some(g => artist.genres.includes(g))).slice(0, 12);
    return latency({ artist, tracks, albums, playlists, related });
  },
  async getPlaylist(id) {
    const playlist = playlistById.get(id);
    return playlist ? latency({ playlist, tracks: tracksOf(playlist.trackIds) }) : null;
  },
  async getFacet(facet: Facet, id: string) {
    const info = (FACETS[facet] as Record<string, FacetInfo>)[id];
    if (!info) return null;
    const match = (t: Track) => (facet === 'genre' ? t.genre === id : facet === 'language' ? t.language === id : t.moods.includes(id as Track['moods'][number]));
    const tracks = TRACKS.filter(match);
    const ids = new Set(tracks.map(t => t.id));
    return latency({
      facet: info,
      tracks,
      playlists: PLAYLISTS.filter(pl => pl.trackIds.filter(t => ids.has(t)).length >= 3),
      albums: ALBUMS.filter(a => a.trackIds.some(t => ids.has(t))),
    });
  },
  async listFacets(facet) {
    const counts = new Map<string, number>();
    for (const t of TRACKS) {
      const keys = facet === 'genre' ? [t.genre] : facet === 'language' ? [t.language] : t.moods;
      for (const k of keys) counts.set(k, (counts.get(k) ?? 0) + 1);
    }
    return Object.values(FACETS[facet]).filter(f => counts.has(f.id));
  },
  async listPlaylists() { return PLAYLISTS; },
  async listAlbums() { return ALBUMS; },
  async listArtists() { return ARTISTS; },
  async search(raw) {
    const query = normalise(raw);
    const empty: SearchResults = { query: raw, top: null, tracks: [], artists: [], albums: [], playlists: [] };
    if (!query) return empty;
    const tokens = query.split(' ');
    const tracks = rank(TRACKS, t => `${t.title} ${t.artists.map(a => a.name).join(' ')} ${t.album?.title ?? ''}`, query, tokens, 30);
    const artists = rank(ARTISTS, a => a.name, query, tokens, 12);
    const albums = rank(ALBUMS, a => `${a.title} ${a.artists.map(x => x.name).join(' ')}`, query, tokens, 12);
    const playlists = rank(PLAYLISTS, p => `${p.title} ${p.tags.join(' ')}`, query, tokens, 12);

    const candidates: [SearchResults['top'], number][] = [];
    if (artists[0]) candidates.push([{ kind: 'artist', item: artists[0] }, score(artists[0].name, query, tokens) + 5]);
    if (tracks[0]) candidates.push([{ kind: 'track', item: tracks[0] }, score(tracks[0].title, query, tokens)]);
    if (albums[0]) candidates.push([{ kind: 'album', item: albums[0] }, score(albums[0].title, query, tokens) + 2]);
    if (playlists[0]) candidates.push([{ kind: 'playlist', item: playlists[0] }, score(playlists[0].title, query, tokens) + 1]);
    candidates.sort((a, b) => b[1] - a[1]);
    return latency({ query: raw, top: candidates[0]?.[0] ?? null, tracks, artists, albums, playlists }, 200);
  },
};
