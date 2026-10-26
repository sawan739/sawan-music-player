import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { catalog } from '@/services/catalog';
import type { Facet } from '@/types/music';
import { FACETS } from '@/data/taxonomy';
import { Artwork } from '@/components/music/artwork';
import { CollectionHeader } from '@/components/music/collection-header';
import { CollectionActions } from '@/components/music/collection-actions';
import { TrackList } from '@/components/music/track-list';
import { Shelf } from '@/components/music/shelf';
import { CollectionCard } from '@/components/music/cards';
import { plural } from '@/utils/format';

type Props = { params: Promise<{ facet: string; id: string }> };
const LABELS: Record<Facet, string> = { genre: 'Genre', mood: 'Mood', language: 'Language' };
const isFacet = (f: string): f is Facet => f in FACETS;

export async function generateStaticParams() {
  return (Object.keys(FACETS) as Facet[]).flatMap(facet => Object.keys(FACETS[facet]).map(id => ({ facet, id })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { facet, id } = await params;
  const info = isFacet(facet) ? (FACETS[facet] as Record<string, { name: string }>)[id] : undefined;
  return info ? { title: info.name } : {};
}

export default async function FacetPage({ params }: Props) {
  const { facet, id } = await params;
  if (!isFacet(facet)) notFound();
  const page = await catalog.getFacet(facet, id);
  if (!page) notFound();
  const { facet: info, tracks, playlists, albums } = page;
  const context = { label: info.name, href: `/discover/${facet}/${id}` };

  return (
    <>
      <CollectionHeader
        palette={info.palette}
        art={<Artwork art={{ palette: info.palette, pattern: info.pattern, seed: id.length * 17 }} label={info.name} className="aspect-square w-full" rounded="rounded-2xl" />}
        eyebrow={LABELS[facet]}
        title={info.name}
        description={info.description}
        meta={<span>{plural(tracks.length, 'song')}</span>}
      />
      <CollectionActions tracks={tracks} context={context} />
      {(playlists.length > 0 || albums.length > 0) && (
        <Shelf title="Playlists & albums" className="mb-8">
          {albums.map(a => <CollectionCard key={a.id} kind="album" item={a} />)}
          {playlists.map(p => <CollectionCard key={p.id} kind="playlist" item={p} />)}
        </Shelf>
      )}
      <section className="px-2 sm:px-6" aria-label="Songs">
        <h2 className="mb-2 px-2 font-display text-xl font-bold sm:text-2xl">Songs</h2>
        {tracks.length ? <TrackList tracks={tracks} context={context} showAlbum /> : <p className="px-3 py-10 text-muted">No songs here yet.</p>}
      </section>
    </>
  );
}
