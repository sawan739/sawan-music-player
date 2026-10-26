import type { Track } from '@/types/music';
import { PlaybackError, type EngineEvents, type LoadOptions, type PlaybackEngine } from './types';
import { resolveVideoId, rejectVideoId } from '@/services/youtube/resolve-video';

type YTPlayer = {
  loadVideoById(o: { videoId: string; startSeconds?: number }): void;
  cueVideoById(o: { videoId: string; startSeconds?: number }): void;
  playVideo(): void;
  pauseVideo(): void;
  stopVideo(): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  setVolume(v: number): void;
  mute(): void;
  unMute(): void;
  getCurrentTime(): number;
  getDuration(): number;
  destroy(): void;
};
type YTNamespace = { Player: new (el: HTMLElement, options: object) => YTPlayer };

declare global {
  interface Window { YT?: YTNamespace; onYouTubeIframeAPIReady?: () => void }
}

const YT_ERRORS: Record<number, string> = {
  2: 'This YouTube video ID is invalid.',
  5: 'YouTube could not play in this browser. Try Chrome, Firefox or Edge.',
  100: 'This video was removed or made private.',
  101: 'The owner does not allow this video to be embedded.',
  150: 'The owner does not allow this video to be embedded.',
};

let apiPromise: Promise<YTNamespace> | null = null;
function loadIframeApi() {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  apiPromise ??= new Promise<YTNamespace>((resolve, reject) => {
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => { previous?.(); resolve(window.YT!); };
    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    script.async = true;
    script.onerror = () => { apiPromise = null; reject(new PlaybackError('Could not reach YouTube. Check your connection.')); };
    document.head.appendChild(script);
  });
  return apiPromise;
}

/**
 * Streams library songs through the official YouTube IFrame player. YouTube's terms
 * require the player to stay visible (min 200×200), so it renders into a host element
 * provided by <YouTubeDock/> — never hidden, never audio-only.
 */
export class YouTubeEngine implements PlaybackEngine {
  readonly kind = 'youtube' as const;
  private player: YTPlayer | null = null;
  private ready: Promise<YTPlayer> | null = null;
  private timer: ReturnType<typeof setInterval> | null = null;
  private active = false;
  private volume = 0.8;
  private muted = false;
  private songId: number | null = null;
  private videoId: string | null = null;
  private tried: string[] = [];
  private retrying = false;
  private requestCurrent: (() => boolean) | null = null;
  private autoplay = true;
  private startAt = 0;

  constructor(private events: EngineEvents, private getHost: () => HTMLElement | null) {}

  private ensurePlayer() {
    this.ready ??= (async () => {
      const YT = await loadIframeApi();
      const host = this.getHost();
      if (!host) throw new PlaybackError('The video player is not mounted.');
      const mount = document.createElement('div');
      host.appendChild(mount);
      return new Promise<YTPlayer>(resolve => {
        const player = new YT.Player(mount, {
          width: '100%', height: '100%',
          playerVars: { playsinline: 1, rel: 0, controls: 1, modestbranding: 1 },
          events: {
            onReady: () => { this.player = player; this.applyVolume(); resolve(player); },
            onStateChange: (e: { data: number }) => this.handleState(e.data),
            onError: (e: { data: number }) => {
              if (!this.active) return;
              // 5 is a browser/player failure, not a bad video — swapping videos won't help and burns API quota.
              if ([2, 100, 101, 150].includes(e.data) && this.songId !== null && this.videoId) {
                void this.retryAlternative();
              } else this.events.onError(YT_ERRORS[e.data] ?? 'This YouTube video cannot be played here.');
            },
          },
        });
      });
    })();
    this.ready.catch(() => { this.ready = null; });
    return this.ready;
  }

  private async retryAlternative() {
    if (this.retrying || this.songId === null || !this.videoId || !this.requestCurrent?.()) return;
    this.retrying = true;
    try {
      rejectVideoId(this.songId, this.videoId);
      this.tried.push(this.videoId);
      if (this.tried.length >= 4) throw new PlaybackError("No playable YouTube version was found for this song.");
      this.events.onStatus("loading");
      const videoId = await resolveVideoId(this.songId, this.tried);
      if (!this.active || !this.requestCurrent?.()) return;
      this.videoId = videoId;
      if (this.autoplay) this.player?.loadVideoById({ videoId, startSeconds: this.startAt });
      else this.player?.cueVideoById({ videoId, startSeconds: this.startAt });
    } catch (error) {
      if (this.active && this.requestCurrent?.()) this.events.onError(error instanceof Error ? error.message : "YouTube playback failed.");
    } finally { this.retrying = false; }
  }

  private handleState(state: number) {
    if (!this.active) return;
    // -1 unstarted, 0 ended, 1 playing, 2 paused, 3 buffering, 5 cued
    if (state === 1) { this.events.onStatus('playing'); this.startClock(); }
    else if (state === 2 || state === 5) { this.events.onStatus('paused'); this.tick(); this.stopClock(); }
    else if (state === 3) this.events.onStatus('buffering');
    else if (state === 0) { this.stopClock(); this.events.onStatus('ended'); }
  }

  private tick() {
    if (!this.player || !this.active) return;
    try { this.events.onTime(this.player.getCurrentTime() || 0, this.player.getDuration() || 0); } catch { /* player not ready */ }
  }
  private startClock() { this.stopClock(); this.timer = setInterval(() => this.tick(), 250); }
  private stopClock() { if (this.timer) clearInterval(this.timer); this.timer = null; }
  private applyVolume() {
    if (!this.player) return;
    this.player.setVolume(Math.round(this.volume * 100));
    if (this.muted) this.player.mute(); else this.player.unMute();
  }

  async load(track: Track, { autoplay, startAt = 0, isCurrent }: LoadOptions) {
    if (track.source.kind !== 'youtube') throw new PlaybackError('Unsupported source for YouTube engine.');
    this.active = true;
    this.songId = track.source.songId;
    this.videoId = null;
    this.tried = [];
    this.retrying = false;
    this.requestCurrent = isCurrent;
    this.autoplay = autoplay;
    this.startAt = Math.floor(startAt);
    this.events.onStatus('loading');
    const [videoId, player] = await Promise.all([resolveVideoId(track.source.songId), this.ensurePlayer()]);
    if (!isCurrent()) return;
    this.videoId = videoId;
    const start = Math.floor(startAt);
    if (autoplay) player.loadVideoById({ videoId, startSeconds: start });
    else player.cueVideoById({ videoId, startSeconds: start });
  }

  play() { this.player?.playVideo(); }
  pause() { this.player?.pauseVideo(); }
  seek(seconds: number) { this.player?.seekTo(Math.max(0, seconds), true); this.tick(); }
  setVolume(volume: number, muted: boolean) { this.volume = volume; this.muted = muted; this.applyVolume(); }

  stop() {
    this.active = false;
    this.stopClock();
    try { this.player?.stopVideo(); } catch { /* not ready */ }
  }

  destroy() {
    this.stop();
    this.player?.destroy();
    this.player = null;
    this.ready = null;
  }
}
