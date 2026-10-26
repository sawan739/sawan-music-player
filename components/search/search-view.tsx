'use client';
import Link from 'next/link';
import { useEffect, useMemo, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Clock, Search, SearchX, WifiOff, X } from 'lucide-react';
import type { FacetInfo } from '@/types/music';
import type { SearchResults } from '@/services/catalog/types';
import { useSearch } from '@/hooks/use-search';
import { useUIStore } from '@/store/ui-store';
import { useLibraryStore } from '@/store/library-store';
import { usePlayerStore } from '@/store/player-store';
import { Artwork, TrackArtwork } from '@/components/music/artwork';
import { PlayButton } from '@/components/music/play-button';
import { TrackList } from '@/components/music/track-list';
import { ExpandableTrackList } from '@/components/music/expandable-track-list';
import { Shelf } from '@/components/music/shelf';
import { ArtistCard, CollectionCard } from '@/components/music/cards';
import { FacetTile } from '@/components/music/facet-tile';
import { Skeleton, TrackListSkeleton } from '@/components/ui/skeleton';
import { usePlayCollection } from '@/hooks/use-play-collection';
import { artistNames, initials } from '@/utils/format';

function TopResult({ top }: { top: NonNullable<SearchResults['top']> }) {
  const { kind, item } = top;
  const href = kind === 'track' ? (item.album ? `/album/${item.album.id}` : `/artist/${item.artists[0].id}`) : `/${kind}/${item.id}`;
  const title = kind === 'artist' ? item.name : item.title;
  const ctx = useMemo(() => ({ label: title, href }), [title, href]);
  const collection = usePlayCollection(kind === 'track' ? 'album' : kind, item.id, ctx);
  const subtitle = kind === 'track' ? `Song · ${artistNames(item.artists)}` : kind === 'album' ? `${item.type} · ${artistNames(item.artists)}` : kind === 'artist' ? 'Artist' : 'Playlist';
  const play = () => (kind === 'track' ? usePlayerStore.getState().playTracks([item], 0, { label: item.title, href }) : collection.play());

  return (
    <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="group relative rounded-2xl bg-white/[0.05] p-5 transition hover:bg-white/[0.09]">
      <div className="relative h-24 w-24">
        {kind === 'track' ? <TrackArtwork track={item} className="h-24 w-24 shadow-card" /> : <Artwork art={item.artwork} rounded={kind === 'artist' ? 'rounded-full' : 'rounded-xl'} className="h-24 w-24 shadow-card" />}
        {kind === 'artist' && <span className="absolute inset-0 grid place-items-center font-display text-2xl font-extrabold text-white/90">{initials(item.name)}</span>}
      </div>
      <Link href={href} className="mt-4 block truncate font-display text-3xl font-extrabold tracking-tight after:absolute after:inset-0">{title}</Link>
      <p className="mt-1 truncate text-sm text-muted">{subtitle}</p>
      <div className="absolute bottom-5 right-5 z-10 translate-y-2 opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100">
        <PlayButton size="lg" playing={false} loading={collection.loading} label={`Play ${title}`} onClick={play} />
      </div>
    </motion.div>
  );
}

function Results({ results }: { results: SearchResults }) {
  const { top, tracks, artists, albums, playlists } = results;
  const context = { label: `Search: ${results.query}`, href: '/search' };
  if (!top && !tracks.length) {
    return (
      <div className="flex flex-col items-center px-6 py-20 text-center">
        <SearchX size={44} className="text-faint" />
        <p className="mt-4 font-display text-xl font-bold">No results for “{results.query}”</p>
        <p className="mt-1 text-sm text-muted">Check the spelling, or try a different song, artist or mood.</p>
      </div>
    );
  }
  return (
    <div className="space-y-10">
      <div className="grid gap-6 px-4 sm:px-8 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]">
        {top && (
          <section aria-labelledby="top-result">
            <h2 id="top-result" className="mb-3 font-display text-xl font-bold sm:text-2xl">Top result</h2>
            <TopResult top={top} />
          </section>
        )}
        {tracks.length > 0 && (
          <section aria-labelledby="songs" className="min-w-0">
            <h2 id="songs" className="mb-2 font-display text-xl font-bold sm:text-2xl">Songs</h2>
            <TrackList tracks={tracks.slice(0, 4)} context={context} />
          </section>
        )}
      </div>
      {artists.length > 0 && <Shelf title="Artists">{artists.map(a => <ArtistCard key={a.id} artist={a} />)}</Shelf>}
      {albums.length > 0 && <Shelf title="Albums">{albums.map(a => <CollectionCard key={a.id} kind="album" item={a} />)}</Shelf>}
      {playlists.length > 0 && <Shelf title="Playlists">{playlists.map(p => <CollectionCard key={p.id} kind="playlist" item={p} />)}</Shelf>}
      {tracks.length > 4 && (
        <section className="px-2 sm:px-6" aria-labelledby="all-songs">
          <h2 id="all-songs" className="mb-2 px-2 font-display text-xl font-bold sm:text-2xl">All matching songs</h2>
          <ExpandableTrackList tracks={tracks} context={context} initial={10} showAlbum />
        </section>
      )}
    </div>
  );
}

export function SearchView({ browse }: { browse: FacetInfo[] }) {
  const query = useUIStore(s => s.searchQuery);
  const setQuery = useUIStore(s => s.setSearchQuery);
  const recent = useLibraryStore(s => s.recentSearches);
  const { results, loading, error } = useSearch(query);
  const mobileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus whichever search box is visible (top bar on desktop, inline on mobile).
    const desktop = document.querySelector<HTMLInputElement>('header input[type="search"]');
    (desktop && desktop.offsetParent !== null ? desktop : mobileInput.current)?.focus();
  }, []);

  const remember = () => useLibraryStore.getState().addRecentSearch(query);
  const state = !query.trim() ? 'idle' : error ? 'error' : loading || !results ? 'loading' : 'results';

  return (
    <div className="pt-4">
      <h1 className="sr-only">Search</h1>
      <label className="relative mx-4 mb-6 flex items-center md:hidden">
        <Search size={18} className="pointer-events-none absolute left-4 text-faint" />
        <input
          ref={mobileInput}
          type="search"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && remember()}
          placeholder="What do you want to listen to?"
          aria-label="Search Sawan Music"
          className="h-12 w-full rounded-full bg-white px-11 text-[0.95rem] font-medium text-ink-950 outline-none placeholder:text-ink-500 [&::-webkit-search-cancel-button]:hidden"
        />
        {query && <button type="button" aria-label="Clear search" onClick={() => setQuery('')} className="absolute right-2 grid h-8 w-8 place-items-center rounded-full text-ink-700"><X size={16} /></button>}
      </label>

      <AnimatePresence mode="wait">
        <motion.div key={state} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} onClickCapture={state === 'results' ? remember : undefined}>
          {state === 'idle' && (
            <div className="space-y-8">
              {recent.length > 0 && (
                <section className="px-4 sm:px-8" aria-labelledby="recent-searches">
                  <div className="mb-3 flex items-center justify-between">
                    <h2 id="recent-searches" className="font-display text-xl font-bold">Recent searches</h2>
                    <button type="button" onClick={() => useLibraryStore.getState().clearRecentSearches()} className="text-sm font-semibold text-muted hover:text-mist">Clear</button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recent.map(q => <button key={q} type="button" onClick={() => setQuery(q)} className="chip"><Clock size={14} /> {q}</button>)}
                  </div>
                </section>
              )}
              <section className="px-4 sm:px-8" aria-labelledby="browse-all">
                <h2 id="browse-all" className="mb-3 font-display text-xl font-bold sm:text-2xl">Browse all</h2>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
                  {browse.map((f, i) => <FacetTile key={`${f.facet}-${f.id}`} facet={f} index={i} />)}
                </div>
              </section>
            </div>
          )}
          {state === 'loading' && (
            <div role="status" aria-label="Searching" className="grid gap-6 px-4 sm:px-8 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]">
              <div><Skeleton className="mb-3 h-6 w-32" /><Skeleton className="h-52 w-full rounded-2xl" /></div>
              <div><Skeleton className="mb-3 h-6 w-24" /><TrackListSkeleton rows={4} /></div>
            </div>
          )}
          {state === 'error' && (
            <div role="alert" className="flex flex-col items-center px-6 py-20 text-center">
              <WifiOff size={40} className="text-faint" />
              <p className="mt-4 font-display text-xl font-bold">Search hit a snag</p>
              <p className="mt-1 text-sm text-muted">{error}</p>
            </div>
          )}
          {state === 'results' && results && <Results results={results} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
