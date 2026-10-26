'use client';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { PlayContext, Track } from '@/types/music';
import type { EngineStatus } from '@/services/audio/types';
import { playback } from '@/services/audio/playback-controller';
import { shuffled } from '@/utils/format';

export type RepeatMode = 'off' | 'all' | 'one';

type PlayerState = {
  queue: Track[];
  index: number;
  /** Queue order before shuffle was switched on, so it can be restored. */
  unshuffled: Track[] | null;
  context: PlayContext | null;
  status: EngineStatus;
  error: string | null;
  position: number;
  duration: number;
  volume: number;
  muted: boolean;
  shuffle: boolean;
  repeat: RepeatMode;
  /** Persisted position used to resume after a page reload. */
  resumeAt: number;
};

type PlayerActions = {
  playTracks(tracks: Track[], startIndex?: number, context?: PlayContext | null, options?: { shuffle?: boolean }): void;
  togglePlay(): void;
  play(): void;
  pause(): void;
  next(options?: { auto?: boolean }): void;
  previous(): void;
  seek(seconds: number): void;
  setVolume(volume: number): void;
  toggleMute(): void;
  toggleShuffle(): void;
  cycleRepeat(): void;
  jumpTo(index: number): void;
  playNext(track: Track): void;
  addToQueue(tracks: Track[]): void;
  removeFromQueue(index: number): void;
  setUpcoming(tracks: Track[]): void;
  clearUpcoming(): void;
  /** Restores the persisted track (paused) after a reload. */
  restore(): void;
  // Engine → store
  _status(status: EngineStatus): void;
  _time(position: number, duration: number): void;
  _error(message: string): void;
};

export type PlayerStore = PlayerState & PlayerActions;

export const currentTrackOf = (s: Pick<PlayerState, 'queue' | 'index'>) => s.queue[s.index] ?? null;

export const usePlayerStore = create<PlayerStore>()(
  persist(
    (set, get) => {
      const load = (index: number, autoplay = true, startAt = 0) => {
        const track = get().queue[index];
        if (!track) return;
        set({ index, position: startAt, duration: track.duration ?? 0, error: null, status: 'loading', resumeAt: startAt });
        void playback.load(track, { autoplay, startAt });
      };

      return {
        queue: [], index: 0, unshuffled: null, context: null,
        status: 'idle', error: null, position: 0, duration: 0,
        volume: 0.8, muted: false, shuffle: false, repeat: 'off', resumeAt: 0,

        playTracks(tracks, startIndex = 0, context = null, options) {
          if (!tracks.length) return;
          const start = tracks[startIndex] ?? tracks[0];
          const current = currentTrackOf(get());
          const shuffle = options?.shuffle ?? get().shuffle;
          // Clicking the track that is already loaded just toggles it.
          if (current?.id === start.id && get().context?.label === context?.label && !options?.shuffle) {
            get().togglePlay();
            return;
          }
          const queue = shuffle ? [start, ...shuffled(tracks.filter(t => t.id !== start.id))] : tracks;
          set({ queue, unshuffled: shuffle ? tracks : null, shuffle, context });
          load(shuffle ? 0 : Math.max(0, tracks.indexOf(start)));
        },

        togglePlay() {
          const { status } = get();
          if (status === 'playing' || status === 'buffering') get().pause();
          else get().play();
        },

        play() {
          const s = get();
          if (!currentTrackOf(s)) return;
          if (s.status === 'idle' || s.status === 'error' || s.status === 'ended') load(s.index, true, s.status === 'idle' ? s.resumeAt : 0);
          else playback.play();
        },

        pause() {
          playback.pause();
        },

        next({ auto = false } = {}) {
          const { queue, index, repeat } = get();
          if (!queue.length) return;
          if (auto && repeat === 'one') { load(index); return; }
          if (index < queue.length - 1) load(index + 1);
          else if (repeat === 'all' || (!auto && queue.length > 1)) load(0);
          else set({ status: 'ended', position: 0 });
        },

        previous() {
          const { index, position, queue } = get();
          if (position > 3 || queue.length <= 1) { get().seek(0); return; }
          load(index > 0 ? index - 1 : queue.length - 1);
        },

        seek(seconds) {
          set({ position: seconds, resumeAt: seconds });
          playback.seek(seconds);
        },

        setVolume(volume) {
          const v = Math.min(1, Math.max(0, volume));
          set({ volume: v, muted: v === 0 });
          playback.setVolume(v, v === 0);
        },

        toggleMute() {
          const { muted, volume } = get();
          const next = !muted;
          const v = !next && volume === 0 ? 0.5 : volume;
          set({ muted: next, volume: v });
          playback.setVolume(v, next);
        },

        toggleShuffle() {
          const { shuffle, queue, index, unshuffled } = get();
          const current = queue[index];
          if (!shuffle) {
            const rest = shuffled(queue.filter((_, i) => i !== index));
            set({ shuffle: true, unshuffled: queue, queue: current ? [current, ...rest] : rest, index: 0 });
          } else {
            const original = unshuffled ?? queue;
            const restoredIndex = current ? original.findIndex(t => t.id === current.id) : -1;
            set(restoredIndex >= 0
              ? { shuffle: false, unshuffled: null, queue: original, index: restoredIndex }
              : { shuffle: false, unshuffled: null });
          }
        },

        cycleRepeat() {
          set(s => ({ repeat: s.repeat === 'off' ? 'all' : s.repeat === 'all' ? 'one' : 'off' }));
        },

        jumpTo(index) {
          if (get().queue[index]) load(index);
        },

        playNext(track) {
          const { queue, index } = get();
          if (!queue.length) { get().playTracks([track]); return; }
          const without = queue.filter((t, i) => t.id !== track.id || i === index);
          const currentIndex = without.indexOf(queue[index]);
          without.splice(currentIndex + 1, 0, track);
          set({ queue: without, index: currentIndex });
        },

        addToQueue(tracks) {
          const { queue } = get();
          if (!queue.length) { get().playTracks(tracks); return; }
          const existing = new Set(queue.map(t => t.id));
          set({ queue: [...queue, ...tracks.filter(t => !existing.has(t.id))] });
        },

        removeFromQueue(i) {
          const { queue, index } = get();
          if (i === index || !queue[i]) return;
          set({ queue: queue.filter((_, j) => j !== i), index: i < index ? index - 1 : index });
        },

        setUpcoming(tracks) {
          const { queue, index } = get();
          set({ queue: [...queue.slice(0, index + 1), ...tracks, ...queue.slice(index + 1 + tracks.length)] });
        },

        clearUpcoming() {
          const { queue, index } = get();
          set({ queue: queue.slice(0, index + 1) });
        },

        restore() {
          const s = get();
          playback.setVolume(s.volume, s.muted);
          const track = currentTrackOf(s);
          if (track) set({ status: 'idle', position: s.resumeAt, duration: track.duration ?? 0 });
        },

        _status(status) {
          set(status === 'ended' ? { status, resumeAt: 0 } : { status });
          if (status === 'ended') get().next({ auto: true });
        },
        _time(position, duration) {
          set({ position, duration: Number.isFinite(duration) && duration > 0 ? duration : get().duration });
        },
        _error(message) {
          set({ status: 'error', error: message });
        },
      };
    },
    {
      name: 'sawan-player',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: s => ({
        queue: s.queue.slice(0, 500), index: s.index, unshuffled: s.unshuffled?.slice(0, 500) ?? null, context: s.context,
        volume: s.volume, muted: s.muted, shuffle: s.shuffle, repeat: s.repeat, resumeAt: s.resumeAt,
      }),
    },
  ),
);
