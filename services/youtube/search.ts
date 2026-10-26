/** Server-side YouTube Data API v3 lookup. Never import this from client code (it needs the API key). */
export type ResolveResult = { videoId: string | null; reason?: 'quota' | 'youtube-error' | 'not-found' | 'missing-key' };

const endpoint = 'https://www.googleapis.com/youtube/v3';

export async function searchYouTube(title: string, artist: string, apiKey: string, exclude: string[] = []): Promise<ResolveResult> {
  const url = new URL(`${endpoint}/search`);
  url.search = new URLSearchParams({
    part: 'snippet', q: `${title} ${artist} official audio`, type: 'video', maxResults: '20',
    videoEmbeddable: 'true', videoSyndicated: 'true', key: apiKey,
  }).toString();
  const result = await fetch(url, { cache: 'no-store' });
  const body = await result.json().catch(() => ({}));
  if (!result.ok) {
    const reason = body?.error?.errors?.[0]?.reason;
    if (result.status === 403 && (reason === 'quotaExceeded' || reason === 'dailyLimitExceeded')) return { videoId: null, reason: 'quota' };
    return { videoId: null, reason: 'youtube-error' };
  }
  const candidates: string[] = (body.items ?? []).map((i: { id?: { videoId?: string } }) => i.id?.videoId).filter((id: string | undefined): id is string => !!id && !exclude.includes(id));
  if (!candidates.length) return { videoId: null, reason: 'not-found' };

  // Confirm the candidates are public and embeddable before choosing one.
  const videosURL = new URL(`${endpoint}/videos`);
  videosURL.search = new URLSearchParams({ part: 'status', id: candidates.join(','), key: apiKey }).toString();
  const videosResult = await fetch(videosURL, { cache: 'no-store' });
  if (!videosResult.ok) return { videoId: null, reason: 'youtube-error' };
  const details = await videosResult.json();
  const available = (details.items ?? []).filter(
    (i: { status?: { embeddable?: boolean; privacyStatus?: string } }) => i.status?.embeddable && i.status?.privacyStatus === 'public',
  );
  return available.length ? { videoId: available[0].id } : { videoId: null, reason: 'not-found' };
}
