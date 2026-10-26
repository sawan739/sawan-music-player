'use client';
import { useCallback } from 'react';
import type { AlbumSummary, ArtistSummary, Track } from '@/types/music';
import { useLibraryStore } from '@/store/library-store';
import { useUIStore } from '@/store/ui-store';
import { usePlayerStore } from '@/store/player-store';

export const useIsLiked = (trackId: string) => useLibraryStore(s => !!s.liked[trackId]);

/** User-facing library actions, each with toast feedback. */
export function useTrackActions() {
  const toast = useUIStore(s => s.toast);

  const toggleLike = useCallback((track: Track) => {
    const liked = useLibraryStore.getState().toggleLike(track);
    toast(liked ? `Added “${track.title}” to Liked Songs` : `Removed from Liked Songs`, liked ? 'like' : 'default');
    return liked;
  }, [toast]);

  const playNext = useCallback((track: Track) => {
    usePlayerStore.getState().playNext(track);
    toast(`“${track.title}” will play next`, 'queue');
  }, [toast]);

  const addToQueue = useCallback((tracks: Track[]) => {
    usePlayerStore.getState().addToQueue(tracks);
    toast(tracks.length === 1 ? `Added “${tracks[0].title}” to queue` : `Added ${tracks.length} songs to queue`, 'queue');
  }, [toast]);

  const addToPlaylist = useCallback((playlistId: string, tracks: Track[]) => {
    const lib = useLibraryStore.getState();
    const name = lib.playlists.find(p => p.id === playlistId)?.name ?? 'playlist';
    const added = lib.addToPlaylist(playlistId, tracks);
    toast(added ? `Added to ${name}` : `Already in ${name}`, added ? 'success' : 'default');
  }, [toast]);

  const toggleSaveAlbum = useCallback((album: AlbumSummary) => {
    const saved = useLibraryStore.getState().toggleSaveAlbum(album);
    toast(saved ? `Saved “${album.title}” to your library` : 'Removed from your library', saved ? 'success' : 'default');
  }, [toast]);

  const toggleFollow = useCallback((artist: ArtistSummary) => {
    const following = useLibraryStore.getState().toggleFollowArtist(artist);
    toast(following ? `Following ${artist.name}` : `Unfollowed ${artist.name}`, following ? 'success' : 'default');
  }, [toast]);

  return { toggleLike, playNext, addToQueue, addToPlaylist, toggleSaveAlbum, toggleFollow };
}
