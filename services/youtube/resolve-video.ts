/** Client-side songId → YouTube videoId resolution with layered caching. */
import resolved from '@/data/resolved.json';
import { PlaybackError } from '@/services/audio/types';

type VideoIdCache = { get(songId: number): string | undefined; set(songId: number, videoId: string): void; remove(songId: number): void };

const preResolved = resolved as Record<string, string>;
let cache: VideoIdCache = { get: () => undefined, set: () => {}, remove: () => {} };
const inflight = new Map<number, Promise<string>>();
const rejected = new Map<number, Set<string>>();

/** The library store injects its persisted map so resolved IDs survive reloads. */
export function setVideoIdCache(next: VideoIdCache) {
  cache = next;
}

export function knownVideoId(songId: number) {
  const blocked = rejected.get(songId);
  const local = cache.get(songId);
  if (local && !blocked?.has(local)) return local;
  const bundled = preResolved[String(songId)];
  return bundled && !blocked?.has(bundled) ? bundled : undefined;
}

const REASONS: Record<string, string> = {
  'missing-key': 'YouTube lookup is not configured. Add YOUTUBE_API_KEY to .env.local.',
  quota: 'YouTube API quota reached for today. Try again later or play Sawan Originals.',
  'not-found': 'No playable version of this song was found on YouTube.',
  'youtube-error': 'YouTube could not be reached right now.',
};

export function rejectVideoId(songId: number, videoId: string) {
  const bad = rejected.get(songId) ?? new Set<string>();
  bad.add(videoId);
  rejected.set(songId, bad);
  cache.remove(songId);
}

export function resolveVideoId(songId: number, exclude: string[] = []): Promise<string> {
  const known = exclude.length ? undefined : knownVideoId(songId);
  if (known) return Promise.resolve(known);
  const pending = inflight.get(songId);
  if (pending) return pending;
  const request = (async () => {
    let res: Response;
    try { res = await fetch(`/api/resolve?id=${songId}${exclude.length ? `&exclude=${encodeURIComponent(exclude.join(","))}` : ""}`, { cache: "no-store" }); }
    catch { throw new PlaybackError('You appear to be offline.'); }
    const body = await res.json().catch(() => ({}));
    if (!res.ok || !body.videoId) throw new PlaybackError(REASONS[body.reason] ?? 'This song is unavailable right now.');
    cache.set(songId, body.videoId);
    return body.videoId as string;
  })().finally(() => inflight.delete(songId));
  inflight.set(songId, request);
  return request;
}
