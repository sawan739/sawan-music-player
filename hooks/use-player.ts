'use client';
import { useShallow } from 'zustand/react/shallow';
import { currentTrackOf, usePlayerStore } from '@/store/player-store';

/** The track currently loaded in the player (or null). */
export const useCurrentTrack = () => usePlayerStore(s => currentTrackOf(s));

export const useIsPlaying = () => usePlayerStore(s => s.status === 'playing' || s.status === 'buffering' || s.status === 'loading');

/** `true` while this exact track is current; `playing` only while audio is running. */
export function useTrackState(trackId: string) {
  return usePlayerStore(
    useShallow(s => {
      const current = currentTrackOf(s)?.id === trackId;
      return { current, playing: current && (s.status === 'playing' || s.status === 'buffering') };
    }),
  );
}

/** Transport state for control bars — progress lives separately so controls don't re-render 4×/second. */
export const useTransport = () =>
  usePlayerStore(
    useShallow(s => ({
      status: s.status, error: s.error, shuffle: s.shuffle, repeat: s.repeat,
      togglePlay: s.togglePlay, next: s.next, previous: s.previous, toggleShuffle: s.toggleShuffle, cycleRepeat: s.cycleRepeat,
    })),
  );

export const useProgress = () => usePlayerStore(useShallow(s => ({ position: s.position, duration: s.duration, seek: s.seek })));
