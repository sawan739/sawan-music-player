import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { catalog } from '@/services/catalog';
import { Artwork } from '@/components/music/artwork';
import { CollectionHeader } from '@/components/music/collection-header';
import { CollectionActions } from '@/components/music/collection-actions';
import { TrackList } from '@/components/music/track-list';
import { Shelf } from '@/components/music/shelf';
import { CollectionCard } from '@/components/music/cards';
import { formatDate, formatTotalDuration, plural } from '@/utils/format';
import { GENRES } from '@/data/taxonomy';

type Props = { params: Promise<{ id: string }> };

export async function generateStaticParams() {
  return (await catalog.listAlbums()).map(a => ({ id: a.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = await catalog.getAlbum((await params).id);
  return page ? { title: `${page.album.title} — ${page.album.artists.map(a => a.name).join(', ')}`, description: page.album.description } : {};
}

export default async function AlbumPage({ params }: Props) {
  const page = await catalog.getAlbum((await params).id);
  if (!page) notFound();
  const { album, tracks, moreByArtist } = page;
  const href = `/album/${album.id}`;
  const total = tracks.reduce((sum, t) => sum + (t.duration ?? 0), 0);
  const summary = { id: album.id, title: album.title, type: album.type, artists: album.artists, artwork: album.artwork, releaseDate: album.releaseDate };

  return (
    <>
      <CollectionHeader
        palette={album.artwork.palette}
        art={<Artwork art={album.artwork} className="aspect-square w-full" rounded="rounded-2xl" />}
        eyebrow={album.type}
        title={album.title}
        description={album.description}
        meta={<>
          {album.artists.map(a => <Link key={a.id} href={`/artist/${a.id}`} className="font-bold text-white hover:underline">{a.name}</Link>)}
          <span aria-hidden="true">•</span><span>{album.releaseDate.slice(0, 4)}</span>
          <span aria-hidden="true">•</span><span>{plural(tracks.length, 'song')}, {formatTotalDuration(total)}</span>
        </>}
      />
      <CollectionActions tracks={tracks} context={{ label: album.title, href }} album={summary} />
      <section className="px-2 sm:px-6" aria-label="Tracks">
        <TrackList tracks={tracks} context={{ label: album.title, href }} numbered showHeader />
      </section>
      <dl className="mt-8 space-y-1 px-4 text-sm text-faint sm:px-8">
        <div><dt className="inline">Released </dt><dd className="inline text-muted">{formatDate(album.releaseDate)}</dd></div>
        <div><dt className="inline">Genre </dt><dd className="inline"><Link href={`/discover/genre/${album.genre}`} className="text-muted hover:text-mist hover:underline">{GENRES[album.genre].name}</Link></dd></div>
        <div><dd className="text-xs">℗ {album.releaseDate.slice(0, 4)} {album.label}. Original audio generated for this demo.</dd></div>
      </dl>
      {moreByArtist.length > 0 && (
        <Shelf title={moreByArtist.some(a => a.artists[0].id === album.artists[0].id) ? `More by ${album.artists[0].name}` : 'More Sawan Originals'} className="mt-10">
          {moreByArtist.map(a => <CollectionCard key={a.id} kind="album" item={a} />)}
        </Shelf>
      )}
    </>
  );
}
