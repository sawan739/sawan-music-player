import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { catalog } from '@/services/catalog';
import { Artwork } from '@/components/music/artwork';
import { CollectionHeader } from '@/components/music/collection-header';
import { CollectionActions } from '@/components/music/collection-actions';
import { ExpandableTrackList } from '@/components/music/expandable-track-list';
import { Shelf } from '@/components/music/shelf';
import { ArtistCard, CollectionCard } from '@/components/music/cards';
import { GENRES } from '@/data/taxonomy';
import { initials, plural } from '@/utils/format';

type Props = { params: Promise<{ id: string }> };

export async function generateStaticParams() {
  return (await catalog.listArtists()).map(a => ({ id: a.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = await catalog.getArtist((await params).id);
  return page ? { title: page.artist.name } : {};
}

export default async function ArtistPage({ params }: Props) {
  const page = await catalog.getArtist((await params).id);
  if (!page) notFound();
  const { artist, tracks, albums, playlists, related } = page;
  const href = `/artist/${artist.id}`;
  const context = { label: artist.name, href };

  return (
    <>
      <CollectionHeader
        palette={artist.artwork.palette}
        round
        art={
          <div className="relative">
            <Artwork art={artist.artwork} className="aspect-square w-full" rounded="rounded-full" />
            <span className="absolute inset-0 grid place-items-center font-display text-6xl font-extrabold text-white/90 drop-shadow-xl">{initials(artist.name)}</span>
          </div>
        }
        eyebrow={artist.origin === 'original' ? 'Sawan Originals artist' : 'Artist'}
        title={artist.name}
        description={artist.bio ?? 'From your personal library.'}
        meta={<>
          <span>{plural(tracks.length, 'song')}</span>
          {albums.length > 0 && <><span aria-hidden="true">•</span><span>{plural(albums.length, 'release')}</span></>}
          <span aria-hidden="true">•</span>
          {artist.genres.map((g, i) => <span key={g}>{i > 0 && ', '}<Link href={`/discover/genre/${g}`} className="hover:underline">{GENRES[g].name}</Link></span>)}
        </>}
      />
      <CollectionActions tracks={tracks} context={context} artist={{ id: artist.id, name: artist.name, artwork: artist.artwork }} />

      <section className="px-2 sm:px-6" aria-labelledby="popular">
        <h2 id="popular" className="mb-2 px-2 font-display text-xl font-bold sm:text-2xl">Popular</h2>
        <ExpandableTrackList tracks={tracks} context={context} showAlbum />
      </section>

      <div className="mt-10 space-y-10">
        {albums.length > 0 && (
          <Shelf title="Discography">{albums.map(a => <CollectionCard key={a.id} kind="album" item={a} />)}</Shelf>
        )}
        {playlists.length > 0 && (
          <Shelf title={`Featuring ${artist.name}`}>{playlists.map(p => <CollectionCard key={p.id} kind="playlist" item={p} />)}</Shelf>
        )}
        {related.length > 0 && (
          <Shelf title="Fans also like">{related.map(a => <ArtistCard key={a.id} artist={a} />)}</Shelf>
        )}
      </div>
    </>
  );
}
