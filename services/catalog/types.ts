import type { Album, Artist, Facet, FacetInfo, Playlist, Track } from '@/types/music';

export type SearchResults = {
  query: string;
  top: { kind: 'track'; item: Track } | { kind: 'artist'; item: Artist } | { kind: 'album'; item: Album } | { kind: 'playlist'; item: Playlist } | null;
  tracks: Track[];
  artists: Artist[];
  albums: Album[];
  playlists: Playlist[];
};

export type HomeFeed = {
  featured: ({ kind: 'album'; item: Album } | { kind: 'playlist'; item: Playlist })[];
  trending: Track[];
  newReleases: Album[];
  originals: Track[];
  artists: Artist[];
  playlists: Playlist[];
  monsoon: Track[];
};

export type ArtistPage = { artist: Artist; tracks: Track[]; albums: Album[]; playlists: Playlist[]; related: Artist[] };
export type AlbumPage = { album: Album; tracks: Track[]; moreByArtist: Album[] };
export type PlaylistPage = { playlist: Playlist; tracks: Track[] };
export type FacetPage = { facet: FacetInfo; tracks: Track[]; playlists: Playlist[]; albums: Album[] };

/**
 * The single seam between the UI and wherever music metadata lives.
 * `localCatalog` implements it from bundled data; a real provider (JioSaavn-style
 * API, Spotify Web API, your own backend…) only needs to implement this interface.
 */
export interface MusicCatalog {
  getHome(): Promise<HomeFeed>;
  getTrack(id: string): Promise<Track | null>;
  getAlbum(id: string): Promise<AlbumPage | null>;
  getArtist(id: string): Promise<ArtistPage | null>;
  getPlaylist(id: string): Promise<PlaylistPage | null>;
  getFacet(facet: Facet, id: string): Promise<FacetPage | null>;
  listFacets(facet: Facet): Promise<FacetInfo[]>;
  listPlaylists(): Promise<Playlist[]>;
  listAlbums(): Promise<Album[]>;
  listArtists(): Promise<Artist[]>;
  search(query: string): Promise<SearchResults>;
}
