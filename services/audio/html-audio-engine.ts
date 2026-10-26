import type { Track } from '@/types/music';
import { PlaybackError, type EngineEvents, type LoadOptions, type PlaybackEngine } from './types';

const MEDIA_ERRORS: Record<number, string> = {
  1: 'Playback was aborted.',
  2: 'Network error while loading this track.',
  3: 'This audio file could not be decoded.',
  4: 'This track is unavailable or its format is not supported.',
};

/** Plays direct audio URLs through a single shared HTMLAudioElement. */
export class HtmlAudioEngine implements PlaybackEngine {
  readonly kind = 'audio' as const;
  private el: HTMLAudioElement | null = null;
  private active = false;
  private pendingStart = 0;
  private wantPlay = false;
  /** Swapping `src` fires a spurious `pause`; ignore it until the new source is ready. */
  private loading = false;
  private cleanup: (() => void) | null = null;

  constructor(private events: EngineEvents) {}

  private audio() {
    if (this.el) return this.el;
    const a = new Audio();
    a.preload = 'auto';
    const on = <K extends keyof HTMLMediaElementEventMap>(type: K, fn: () => void) => {
      const handler = () => { if (this.active) fn(); };
      a.addEventListener(type, handler);
      return () => a.removeEventListener(type, handler);
    };
    const offs = [
      on('loadedmetadata', () => {
        if (this.pendingStart > 0 && this.pendingStart < a.duration - 1) a.currentTime = this.pendingStart;
        this.pendingStart = 0;
        this.loading = false;
        this.events.onTime(a.currentTime, a.duration);
        if (!this.wantPlay) this.events.onStatus('paused');
      }),
      on('timeupdate', () => this.events.onTime(a.currentTime, a.duration)),
      on('durationchange', () => this.events.onTime(a.currentTime, a.duration)),
      on('waiting', () => this.events.onStatus('buffering')),
      on('playing', () => { this.loading = false; this.events.onStatus('playing'); }),
      on('pause', () => { if (!a.ended && !this.loading) this.events.onStatus('paused'); }),
      on('ended', () => this.events.onStatus('ended')),
      on('error', () => this.events.onError(MEDIA_ERRORS[a.error?.code ?? 4] ?? MEDIA_ERRORS[4])),
    ];
    this.cleanup = () => offs.forEach(off => off());
    this.el = a;
    return a;
  }

  async load(track: Track, { autoplay, startAt = 0, isCurrent }: LoadOptions) {
    if (track.source.kind !== 'audio') throw new PlaybackError('Unsupported source for audio engine.');
    const a = this.audio();
    this.active = true;
    this.wantPlay = autoplay;
    this.pendingStart = startAt;
    this.loading = true;
    this.events.onStatus('loading');
    a.src = track.source.url;
    a.load();
    if (autoplay && isCurrent()) this.play();
  }

  play() {
    const a = this.audio();
    this.wantPlay = true;
    a.play().catch((err: DOMException) => {
      if (!this.active) return;
      // Browsers block autoplay until the user interacts; that is a pause, not an error.
      if (err.name === 'NotAllowedError') this.events.onStatus('paused');
      else if (err.name !== 'AbortError') this.events.onError(MEDIA_ERRORS[a.error?.code ?? 4] ?? 'Playback failed.');
    });
  }

  pause() {
    this.wantPlay = false;
    this.loading = false;
    this.el?.pause();
  }

  seek(seconds: number) {
    if (!this.el) return;
    this.el.currentTime = Math.max(0, seconds);
    this.events.onTime(this.el.currentTime, this.el.duration);
  }

  setVolume(volume: number, muted: boolean) {
    const a = this.audio();
    a.volume = Math.min(1, Math.max(0, volume));
    a.muted = muted;
  }

  stop() {
    this.active = false;
    this.wantPlay = false;
    if (!this.el) return;
    this.el.pause();
    this.el.removeAttribute('src');
    this.el.load();
  }

  destroy() {
    this.stop();
    this.cleanup?.();
    this.el = null;
  }
}
