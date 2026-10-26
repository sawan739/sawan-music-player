import { NextResponse } from 'next/server';
import { catalog } from '@/services/catalog';
import type { Facet } from '@/types/music';

/** Tracks for a collection, fetched lazily when a card's play button is pressed. */
export async function GET(_req: Request, { params }: { params: Promise<{ kind: string; id: string }> }) {
  const { kind, id } = await params;
  let page;
  switch (kind) {
    case 'album': page = await catalog.getAlbum(id); break;
    case 'playlist': page = await catalog.getPlaylist(id); break;
    case 'artist': page = await catalog.getArtist(id); break;
    case 'genre': case 'mood': case 'language': page = await catalog.getFacet(kind as Facet, id); break;
    default: return NextResponse.json({ error: 'Unknown collection type' }, { status: 400 });
  }
  if (!page) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ tracks: page.tracks }, { headers: { 'Cache-Control': 'public, max-age=300' } });
}
