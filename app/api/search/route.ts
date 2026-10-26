import { NextRequest, NextResponse } from 'next/server';
import { catalog } from '@/services/catalog';

export async function GET(request: NextRequest) {
  const q = (request.nextUrl.searchParams.get('q') ?? '').slice(0, 100);
  try {
    const results = await catalog.search(q);
    return NextResponse.json(results, { headers: { 'Cache-Control': 'public, max-age=60' } });
  } catch {
    return NextResponse.json({ error: 'Search is unavailable right now.' }, { status: 502 });
  }
}
