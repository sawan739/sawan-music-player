import type { Track, TrackSource } from '@/types/music';

export type EngineStatus = 'idle' | 'loading' | 'buffering' | 'playing' | 'paused' | 'ended' | 'error';

export type EngineEvents = {
  onStatus(status: EngineStatus): void;
  onTime(position: number, duration: number): void;
  onError(message: string): void;
};

export type LoadOptions = {
  autoplay: boolean;
  startAt?: number;
  /** False once a newer load has started; engines must stop applying stale work. */
  isCurrent: () => boolean;
};

/** One implementation per `TrackSource['kind']`. Engines own their media element; nothing else touches it. */
export interface PlaybackEngine {
  readonly kind: TrackSource['kind'];
  load(track: Track, options: LoadOptions): Promise<void>;
  play(): void;
  pause(): void;
  seek(seconds: number): void;
  setVolume(volume: number, muted: boolean): void;
  /** Stop and release the current media so another engine can take over. */
  stop(): void;
  destroy(): void;
}

export class PlaybackError extends Error {}
