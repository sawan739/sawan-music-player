import type { Metadata } from 'next';
import { catalog } from '@/services/catalog';
import { FacetTile } from '@/components/music/facet-tile';
import { Shelf } from '@/components/music/shelf';
import { CollectionCard } from '@/components/music/cards';

export const metadata: Metadata = { title: 'Discover' };

export default async function DiscoverPage() {
  const [moods, genres, languages, playlists, albums] = await Promise.all([
    catalog.listFacets('mood'), catalog.listFacets('genre'), catalog.listFacets('language'), catalog.listPlaylists(), catalog.listAlbums(),
  ]);
  const grid = 'grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4';
  return (
    <div className="space-y-10 pt-4">
      <header className="px-4 sm:px-8">
        <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">Discover</h1>
        <p className="mt-1 text-muted">Explore by mood, genre and language.</p>
      </header>

      <section className="px-4 sm:px-8" aria-labelledby="moods">
        <h2 id="moods" className="mb-3 font-display text-xl font-bold sm:text-2xl">Moods & moments</h2>
        <div className={grid}>{moods.map((f, i) => <FacetTile key={f.id} facet={f} index={i} />)}</div>
      </section>

      <Shelf title="Editor's picks" subtitle="Curated playlists">
        {playlists.map(p => <CollectionCard key={p.id} kind="playlist" item={p} />)}
      </Shelf>

      <section className="px-4 sm:px-8" aria-labelledby="genres">
        <h2 id="genres" className="mb-3 font-display text-xl font-bold sm:text-2xl">Genres</h2>
        <div className={grid}>{genres.map((f, i) => <FacetTile key={f.id} facet={f} index={i} />)}</div>
      </section>

      <Shelf title="Albums & EPs" subtitle="Sawan Originals">
        {albums.map(a => <CollectionCard key={a.id} kind="album" item={a} />)}
      </Shelf>

      <section className="px-4 sm:px-8" aria-labelledby="languages">
        <h2 id="languages" className="mb-3 font-display text-xl font-bold sm:text-2xl">Languages</h2>
        <div className={grid}>{languages.map((f, i) => <FacetTile key={f.id} facet={f} index={i} />)}</div>
      </section>
    </div>
  );
}
