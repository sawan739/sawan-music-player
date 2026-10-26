import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { catalog } from '@/services/catalog';
import { Artwork } from '@/components/music/artwork';
import { LogoMark } from '@/components/brand/logo';
import { CollectionHeader } from '@/components/music/collection-header';
import { CollectionActions } from '@/components/music/collection-actions';
import { TrackList } from '@/components/music/track-list';
import { plural } from '@/utils/format';

type Props = { params: Promise<{ id: string }> };

export async function generateStaticParams() {
  return (await catalog.listPlaylists()).map(p => ({ id: p.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = await catalog.getPlaylist((await params).id);
  return page ? { title: page.playlist.title, description: page.playlist.description } : {};
}

export default async function PlaylistPage({ params }: Props) {
  const page = await catalog.getPlaylist((await params).id);
  if (!page) notFound();
  const { playlist, tracks } = page;
  const context = { label: playlist.title, href: `/playlist/${playlist.id}` };
  const instant = tracks.filter(t => t.source.kind === 'audio').length;

  return (
    <>
      <CollectionHeader
        palette={playlist.artwork.palette}
        art={<Artwork art={playlist.artwork} label={playlist.title} className="aspect-square w-full" rounded="rounded-2xl" />}
        eyebrow="Playlist"
        title={playlist.title}
        description={playlist.description}
        meta={<>
          <span className="flex items-center gap-1.5 font-bold text-white"><LogoMark className="h-5 w-5" /> Sawan Music</span>
          <span aria-hidden="true">•</span><span>{plural(tracks.length, 'song')}</span>
          {instant > 0 && instant < tracks.length && <><span aria-hidden="true">•</span><span>{instant} Sawan Originals</span></>}
        </>}
      />
      <CollectionActions tracks={tracks} context={context} />
      <section className="px-2 sm:px-6" aria-label="Tracks">
        {tracks.length ? <TrackList tracks={tracks} context={context} showAlbum showHeader /> : <p className="px-3 py-10 text-muted">This playlist is empty.</p>}
      </section>
    </>
  );
}
