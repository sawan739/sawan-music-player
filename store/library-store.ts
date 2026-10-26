'use client';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { AlbumSummary, ArtistSummary, Palette, Track, UserPlaylist } from '@/types/music';

const PLAYLIST_PALETTES: Palette[] = [
  ['#5eead4', '#8b5cf6', '#1e1b4b'], ['#fda4af', '#db2777', '#3b0618'], ['#fcd34d', '#f97316', '#431407'],
  ['#a5f3fc', '#2563eb', '#172554'], ['#bef264', '#0d9488', '#042f2e'], ['#f0abfc', '#9333ea', '#2e1065'],
];

type LikedEntry = { track: Track; addedAt: number };

type LibraryState = {
  liked: Record<string, LikedEntry>;
  recent: Track[];
  playCounts: Record<string, number>;
  playlists: UserPlaylist[];
  savedAlbums: AlbumSummary[];
  followedArtists: ArtistSummary[];
  recentSearches: string[];
  /** Library songId → resolved YouTube videoId, so lookups (and API quota) are spent once. */
  videoIds: Record<string, string>;
};

type LibraryActions = {
  toggleLike(track: Track): boolean;
  recordPlay(track: Track): void;
  clearRecent(): void;
  createPlaylist(name: string, tracks?: Track[]): UserPlaylist;
  renamePlaylist(id: string, name: string, description?: string): void;
  deletePlaylist(id: string): void;
  addToPlaylist(id: string, tracks: Track[]): number;
  removeFromPlaylist(id: string, trackId: string): void;
  reorderPlaylist(id: string, tracks: Track[]): void;
  toggleSaveAlbum(album: AlbumSummary): boolean;
  toggleFollowArtist(artist: ArtistSummary): boolean;
  addRecentSearch(query: string): void;
  clearRecentSearches(): void;
  setVideoId(songId: number, videoId: string): void;
  removeVideoId(songId: number): void;
};

const uid = () => (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID().slice(0, 8) : Math.random().toString(36).slice(2, 10));

export const useLibraryStore = create<LibraryState & LibraryActions>()(
  persist(
    (set, get) => ({
      liked: {}, recent: [], playCounts: {}, playlists: [], savedAlbums: [], followedArtists: [], recentSearches: [], videoIds: {},

      toggleLike(track) {
        const liked = { ...get().liked };
        const nowLiked = !liked[track.id];
        if (nowLiked) liked[track.id] = { track, addedAt: Date.now() };
        else delete liked[track.id];
        set({ liked });
        return nowLiked;
      },

      recordPlay(track) {
        set(s => ({
          recent: [track, ...s.recent.filter(t => t.id !== track.id)].slice(0, 50),
          playCounts: { ...s.playCounts, [track.id]: (s.playCounts[track.id] ?? 0) + 1 },
        }));
      },
      clearRecent() { set({ recent: [] }); },

      createPlaylist(name, tracks = []) {
        const now = Date.now();
        const playlist: UserPlaylist = {
          id: uid(), name: name.trim() || 'My Playlist', description: '', tracks,
          palette: PLAYLIST_PALETTES[get().playlists.length % PLAYLIST_PALETTES.length], createdAt: now, updatedAt: now,
        };
        set(s => ({ playlists: [playlist, ...s.playlists] }));
        return playlist;
      },
      renamePlaylist(id, name, description) {
        set(s => ({ playlists: s.playlists.map(p => (p.id === id ? { ...p, name: name.trim() || p.name, description: description ?? p.description, updatedAt: Date.now() } : p)) }));
      },
      deletePlaylist(id) {
        set(s => ({ playlists: s.playlists.filter(p => p.id !== id) }));
      },
      addToPlaylist(id, tracks) {
        let added = 0;
        set(s => ({
          playlists: s.playlists.map(p => {
            if (p.id !== id) return p;
            const have = new Set(p.tracks.map(t => t.id));
            const fresh = tracks.filter(t => !have.has(t.id));
            added = fresh.length;
            return { ...p, tracks: [...p.tracks, ...fresh], updatedAt: Date.now() };
          }),
        }));
        return added;
      },
      removeFromPlaylist(id, trackId) {
        set(s => ({ playlists: s.playlists.map(p => (p.id === id ? { ...p, tracks: p.tracks.filter(t => t.id !== trackId), updatedAt: Date.now() } : p)) }));
      },
      reorderPlaylist(id, tracks) {
        set(s => ({ playlists: s.playlists.map(p => (p.id === id ? { ...p, tracks, updatedAt: Date.now() } : p)) }));
      },

      toggleSaveAlbum(album) {
        const saved = get().savedAlbums.some(a => a.id === album.id);
        set(s => ({ savedAlbums: saved ? s.savedAlbums.filter(a => a.id !== album.id) : [album, ...s.savedAlbums] }));
        return !saved;
      },
      toggleFollowArtist(artist) {
        const following = get().followedArtists.some(a => a.id === artist.id);
        set(s => ({ followedArtists: following ? s.followedArtists.filter(a => a.id !== artist.id) : [artist, ...s.followedArtists] }));
        return !following;
      },

      addRecentSearch(query) {
        const q = query.trim();
        if (q.length < 2) return;
        set(s => ({ recentSearches: [q, ...s.recentSearches.filter(x => x.toLowerCase() !== q.toLowerCase())].slice(0, 8) }));
      },
      clearRecentSearches() { set({ recentSearches: [] }); },

      removeVideoId(songId) {
        set(s => { const videoIds = { ...s.videoIds }; delete videoIds[String(songId)]; return { videoIds }; });
      },
      setVideoId(songId, videoId) {
        set(s => ({ videoIds: { ...s.videoIds, [songId]: videoId } }));
      },
    }),
    { name: 'sawan-library', version: 1, storage: createJSONStorage(() => localStorage), skipHydration: true },
  ),
);

/** Liked tracks, newest first. */
export const selectLikedTracks = (s: LibraryState) => Object.values(s.liked).sort((a, b) => b.addedAt - a.addedAt).map(e => e.track);
