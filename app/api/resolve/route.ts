import { NextRequest, NextResponse } from 'next/server';
import { LIBRARY_SONGS } from '@/data/library';
import { searchYouTube } from '@/services/youtube/search';
import resolved from '@/data/resolved.json';

export const dynamic = 'force-dynamic';

const saved = resolved as Record<string, string>;
const songById = new Map(LIBRARY_SONGS.map(s => [s.id, s]));

// Runtime writes are intentionally omitted: Vercel deployments have a read-only filesystem.
// `npm run resolve:all` generates the committed cache; clients also cache successful matches.
export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get('id');
  if (!raw || !/^\d+$/.test(raw)) return NextResponse.json({ error: 'Invalid song id' }, { status: 400 });
  const id = Number(raw);
  const song = songById.get(id);
  if (!song) return NextResponse.json({ error: 'Song not found' }, { status: 404 });

  const exclude = (request.nextUrl.searchParams.get('exclude') ?? '').split(',').filter(v => /^[A-Za-z0-9_-]{11}$/.test(v)).slice(0, 10);
  const cached = saved[String(id)];
  if (cached && !exclude.includes(cached)) return NextResponse.json({ videoId: cached, source: 'pre-resolved' }, { headers: { 'Cache-Control': 'public, max-age=86400' } });

  const key = process.env.YOUTUBE_API_KEY;
  if (!key) return NextResponse.json({ videoId: null, reason: 'missing-key' }, { status: 503 });

  const result = await searchYouTube(song.title, song.artist, key, exclude);
  return NextResponse.json(result, {
    status: result.reason === 'quota' ? 429 : 200,
    headers: { 'Cache-Control': result.videoId ? 'public, s-maxage=86400' : 'no-store' },
  });
}
