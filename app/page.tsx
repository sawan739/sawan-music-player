import { catalog } from '@/services/catalog';
import { Greeting } from '@/components/home/greeting';
import { HeroCarousel } from '@/components/home/hero-carousel';
import { EmptyHistoryHint, LikedShelf, QuickPicks, RecentlyPlayedShelf } from '@/components/home/personal-shelves';
import { Shelf } from '@/components/music/shelf';
import { ArtistCard, CollectionCard, TrackCards } from '@/components/music/cards';
import { FacetTile } from '@/components/music/facet-tile';
import { MOODS } from '@/data/taxonomy';

export default async function HomePage() {
  const home = await catalog.getHome();
  return (
    <div className="space-y-10 pt-4">
      <div className="space-y-5">
        <div className="px-4 sm:px-8"><Greeting /></div>
        <QuickPicks playlists={home.playlists.slice(0, 5)} />
      </div>

      <HeroCarousel items={home.featured} />
      <EmptyHistoryHint />
      <RecentlyPlayedShelf />

      <Shelf title="Trending on Sawan" subtitle="What everyone is replaying this week">
        <TrackCards tracks={home.trending} context={{ label: 'Trending on Sawan' }} />
      </Shelf>

      <Shelf title="New releases" subtitle="Fresh Sawan Originals — play instantly" href="/discover">
        {home.newReleases.map(a => <CollectionCard key={a.id} kind="album" item={a} />)}
      </Shelf>

      <Shelf title="Made for Sawan" subtitle="Mixes built from your library" href="/discover">
        {home.playlists.map(p => <CollectionCard key={p.id} kind="playlist" item={p} />)}
      </Shelf>

      <section className="px-4 sm:px-8" aria-label="Moods">
        <h2 className="mb-3 font-display text-xl font-bold tracking-tight sm:text-2xl">Pick a mood</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Object.values(MOODS).map((m, i) => <FacetTile key={m.id} facet={m} index={i} compact />)}
        </div>
      </section>

      <Shelf title="Popular artists" href="/discover">
        {home.artists.map(a => <ArtistCard key={a.id} artist={a} />)}
      </Shelf>

      <Shelf title="Sawan Special" subtitle="Rain songs for grey skies" href="/playlist/sawan-special">
        <TrackCards tracks={home.monsoon} context={{ label: 'Sawan Special', href: '/playlist/sawan-special' }} />
      </Shelf>

      <LikedShelf />

      <Shelf title="Sawan Originals" subtitle="Lo-fi, synthwave, fusion and monsoon pop" href="/playlist/sawan-originals">
        <TrackCards tracks={home.originals} context={{ label: 'Sawan Originals', href: '/playlist/sawan-originals' }} />
      </Shelf>
    </div>
  );
}
