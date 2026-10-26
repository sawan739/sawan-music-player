'use client';
import { useEffect } from 'react';
import { playback } from '@/services/audio/playback-controller';
import { setVideoIdCache, knownVideoId } from '@/services/youtube/resolve-video';
import { currentTrackOf, usePlayerStore } from '@/store/player-store';
import { useLibraryStore } from '@/store/library-store';
import { useUIStore } from '@/store/ui-store';
import { artistNames } from '@/utils/format';

const MAX_ERROR_STREAK = 3;

/**
 * Wires the playback controller to the stores. Renders nothing; mounted once in the shell.
 * Responsibilities: hydration, engine events → store, error auto-skip, play history,
 * resume position, and Media Session (lock screen / hardware keys).
 */
export function PlaybackHost() {
  useEffect(() => {
    const player = usePlayerStore;
    const ui = useUIStore.getState();
    let errorStreak = 0;
    let skipTimer: ReturnType<typeof setTimeout> | undefined;
    let lastRecorded: string | null = null;
    let failedTrackId: string | null = null;

    setVideoIdCache({
      get: id => useLibraryStore.getState().videoIds[id],
      set: (id, videoId) => useLibraryStore.getState().setVideoId(id, videoId),
      remove: id => useLibraryStore.getState().removeVideoId(id),
    });

    playback.connect({
      onStatus(status) {
        player.getState()._status(status);
        if (status === 'playing') {
          errorStreak = 0;
          failedTrackId = null;
          const track = currentTrackOf(player.getState());
          if (track && track.id !== lastRecorded) {
            lastRecorded = track.id;
            useLibraryStore.getState().recordPlay(track);
          }
        }
      },
      onTime(position, duration) {
        player.getState()._time(position, duration);
      },
      onError(message) {
        const s = player.getState();
        s._error(message);
        if (failedTrackId === currentTrackOf(s)?.id) return;
        failedTrackId = currentTrackOf(s)?.id ?? null;
        errorStreak++;
        clearTimeout(skipTimer);
        if (errorStreak >= MAX_ERROR_STREAK) {
          ui.toast('Several tracks in a row could not play, so playback has stopped.', 'error');
          errorStreak = 0;
        } else if (s.queue.length > 1) {
          ui.toast(`${message} Skipping…`, 'error');
          const failedId = currentTrackOf(s)?.id;
          skipTimer = setTimeout(() => {
            if (currentTrackOf(player.getState())?.id === failedId) player.getState().next();
          }, 1600);
        } else {
          ui.toast(message, 'error');
        }
      },
    });

    // Hydrate persisted stores on the client only (avoids SSR/client markup mismatches).
    Promise.all([player.persist.rehydrate(), useLibraryStore.persist.rehydrate()]).then(() => {
      player.getState().restore();
      useUIStore.getState().setHydrated();
    });

    // Remember the playback position so a reload resumes where you left off.
    const savePosition = () => {
      const s = player.getState();
      if (currentTrackOf(s) && s.status !== 'idle') player.setState({ resumeAt: s.position });
    };
    const saver = setInterval(() => { if (player.getState().status === 'playing') savePosition(); }, 5000);
    window.addEventListener('pagehide', savePosition);

    // Media Session: metadata, play state and hardware/lock-screen controls.
    const ms = 'mediaSession' in navigator ? navigator.mediaSession : null;
    if (ms) {
      const handlers: [MediaSessionAction, MediaSessionActionHandler][] = [
        ['play', () => player.getState().play()],
        ['pause', () => player.getState().pause()],
        ['nexttrack', () => player.getState().next()],
        ['previoustrack', () => player.getState().previous()],
        ['seekto', d => d.seekTime != null && player.getState().seek(d.seekTime)],
        ['seekforward', () => { const s = player.getState(); s.seek(Math.min(s.duration, s.position + 10)); }],
        ['seekbackward', () => { const s = player.getState(); s.seek(Math.max(0, s.position - 10)); }],
      ];
      for (const [action, handler] of handlers) {
        try { ms.setActionHandler(action, handler); } catch { /* unsupported action */ }
      }
    }
    let lastTrackId: string | null = null;
    const unsubscribe = player.subscribe(s => {
      if (!ms) return;
      const track = currentTrackOf(s);
      if (track && track.id !== lastTrackId) {
        lastTrackId = track.id;
        const videoId = track.source.kind === 'youtube' ? knownVideoId(track.source.songId) : undefined;
        ms.metadata = new MediaMetadata({
          title: track.title,
          artist: artistNames(track.artists),
          album: track.album?.title ?? 'Sawan Music',
          artwork: videoId ? [{ src: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`, sizes: '480x360', type: 'image/jpeg' }] : [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' }],
        });
      }
      ms.playbackState = s.status === 'playing' || s.status === 'buffering' ? 'playing' : track ? 'paused' : 'none';
    });

    return () => {
      clearTimeout(skipTimer);
      clearInterval(saver);
      window.removeEventListener('pagehide', savePosition);
      unsubscribe();
      playback.destroy();
    };
  }, []);

  return null;
}
