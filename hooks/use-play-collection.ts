'use client';
import { useCallback, useState } from 'react';
import type { PlayContext, Track } from '@/types/music';
import { usePlayerStore } from '@/store/player-store';
import { useUIStore } from '@/store/ui-store';

export type CollectionKind = 'album' | 'playlist' | 'artist' | 'genre' | 'mood' | 'language';

const cache = new Map<string, Track[]>();

export async function fetchCollection(kind: CollectionKind, id: string) {
  const key = `${kind}:${id}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const res = await fetch(`/api/collection/${kind}/${encodeURIComponent(id)}`);
  if (!res.ok) throw new Error('Could not load this collection.');
  const { tracks } = (await res.json()) as { tracks: Track[] };
  cache.set(key, tracks);
  return tracks;
}

/** Loads a collection's tracks on demand and starts playback. */
export function usePlayCollection(kind: CollectionKind, id: string, context: PlayContext) {
  const [loading, setLoading] = useState(false);
  const play = useCallback(async (options?: { shuffle?: boolean }) => {
    setLoading(true);
    try {
      const tracks = await fetchCollection(kind, id);
      if (!tracks.length) { useUIStore.getState().toast('Nothing to play here yet.'); return; }
      usePlayerStore.getState().playTracks(tracks, 0, context, options);
    } catch (err) {
      useUIStore.getState().toast(err instanceof Error ? err.message : 'Something went wrong.', 'error');
    } finally {
      setLoading(false);
    }
  }, [kind, id, context]);
  return { play, loading };
}

/** Whether the player is currently playing from this collection. */
export const useIsPlayingContext = (label: string) =>
  usePlayerStore(s => s.context?.label === label && (s.status === 'playing' || s.status === 'buffering'));
