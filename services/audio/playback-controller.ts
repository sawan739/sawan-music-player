import type { Track, TrackSource } from '@/types/music';
import { HtmlAudioEngine } from './html-audio-engine';
import { YouTubeEngine } from './youtube-engine';
import type { EngineEvents, PlaybackEngine } from './types';

/**
 * Routes playback to the engine matching each track's source and guarantees only one
 * engine is ever active, so two tracks can never play at once. Engines are created
 * lazily in the browser; this module is safe to import during SSR.
 */
class PlaybackController {
  private engines = new Map<TrackSource['kind'], PlaybackEngine>();
  private active: PlaybackEngine | null = null;
  private token = 0;
  private volume = 0.8;
  private muted = false;
  private handlers: EngineEvents = { onStatus() {}, onTime() {}, onError() {} };
  private youtubeHost: HTMLElement | null = null;

  /** Called once by <PlaybackHost/> to receive engine events. */
  connect(handlers: EngineEvents) {
    this.handlers = handlers;
  }

  setYouTubeHost(el: HTMLElement | null) {
    this.youtubeHost = el;
  }

  private engineFor(kind: TrackSource['kind']) {
    let engine = this.engines.get(kind);
    if (engine) return engine;
    // Events from an engine that is no longer active are dropped.
    const isActive = () => this.active === engine;
    const events: EngineEvents = {
      onStatus: status => { if (isActive()) this.handlers.onStatus(status); },
      onTime: (position, duration) => { if (isActive()) this.handlers.onTime(position, duration); },
      onError: message => { if (isActive()) this.handlers.onError(message); },
    };
    engine = kind === 'audio' ? new HtmlAudioEngine(events) : new YouTubeEngine(events, () => this.youtubeHost);
    engine.setVolume(this.volume, this.muted);
    this.engines.set(kind, engine);
    return engine;
  }

  async load(track: Track, options: { autoplay: boolean; startAt?: number }) {
    const token = ++this.token;
    const engine = this.engineFor(track.source.kind);
    if (this.active && this.active !== engine) this.active.stop();
    this.active = engine;
    try {
      await engine.load(track, { ...options, isCurrent: () => token === this.token });
    } catch (err) {
      if (token === this.token) this.handlers.onError(err instanceof Error ? err.message : 'This track could not be played.');
    }
  }

  play() { this.active?.play(); }
  pause() { this.active?.pause(); }
  seek(seconds: number) { this.active?.seek(seconds); }

  setVolume(volume: number, muted: boolean) {
    this.volume = volume;
    this.muted = muted;
    this.engines.forEach(e => e.setVolume(volume, muted));
  }

  stop() {
    this.token++;
    this.active?.stop();
    this.active = null;
  }

  destroy() {
    this.engines.forEach(e => e.destroy());
    this.engines.clear();
    this.active = null;
  }
}

export const playback = new PlaybackController();
