'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Heart, Plus, Trash2 } from 'lucide-react';
import { LIBRARY_TABS, type LibraryTab } from './tabs';
import { useShallow } from 'zustand/react/shallow';
import { useLibraryStore, selectLikedTracks } from '@/store/library-store';
import { useUIStore } from '@/store/ui-store';
import { Artwork } from '@/components/music/artwork';
import { ArtistCard } from '@/components/music/cards';
import { TrackList } from '@/components/music/track-list';
import { Skeleton } from '@/components/ui/skeleton';
import { artistNames, cn, plural } from '@/utils/format';

function Empty({ title, body, action }: { title: string; body: string; action?: React.ReactNode }) {
  return (
    <div className="mx-4 rounded-2xl border border-dashed border-white/10 px-6 py-14 text-center sm:mx-8">
      <p className="font-display text-lg font-bold">{title}</p>
      <p className="mx-auto mt-1 max-w-sm text-sm text-muted">{body}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

const gridItem = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } };

function Tile({ href, title, subtitle, art, round }: { href: string; title: string; subtitle: string; art: React.ReactNode; round?: boolean }) {
  return (
    <motion.li variants={gridItem}>
      <Link href={href} className="group block rounded-2xl p-2.5 transition hover:bg-white/[0.06]">
        <div className={cn('overflow-hidden shadow-card transition duration-300 group-hover:scale-[1.03]', round ? 'rounded-full' : 'rounded-xl')}>{art}</div>
        <p className="mt-3 truncate font-semibold">{title}</p>
        <p className="truncate text-[0.8rem] text-muted">{subtitle}</p>
      </Link>
    </motion.li>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return (
    <motion.ul initial="hidden" animate="show" transition={{ staggerChildren: 0.04 }} className="grid grid-cols-2 gap-1 px-2 sm:grid-cols-3 sm:px-6 lg:grid-cols-4 2xl:grid-cols-6">
      {children}
    </motion.ul>
  );
}

export function LibraryView({ initialTab }: { initialTab: LibraryTab }) {
  const router = useRouter();
  const [tab, setTab] = useState<LibraryTab>(initialTab);
  const hydrated = useUIStore(s => s.hydrated);
  const { playlists, savedAlbums, followedArtists, recent } = useLibraryStore(useShallow(s => ({ playlists: s.playlists, savedAlbums: s.savedAlbums, followedArtists: s.followedArtists, recent: s.recent })));
  const liked = useLibraryStore(useShallow(selectLikedTracks));
  const select = (id: LibraryTab) => { setTab(id); router.replace(id === 'playlists' ? '/library' : `/library?tab=${id}`, { scroll: false }); };

  return (
    <div className="pt-4">
      <header className="flex flex-wrap items-end justify-between gap-4 px-4 sm:px-8">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">Your Library</h1>
          <p className="mt-1 text-muted">Everything you&apos;ve saved, Sawan.</p>
        </div>
        <button type="button" onClick={() => useUIStore.getState().setCreatePlaylistOpen(true)} className="btn-primary"><Plus size={18} /> New playlist</button>
      </header>

      <div role="tablist" aria-label="Library sections" className="no-scrollbar mt-6 flex gap-2 overflow-x-auto px-4 sm:px-8">
        {LIBRARY_TABS.map(t => (
          <button key={t.id} type="button" role="tab" aria-selected={tab === t.id} onClick={() => select(t.id)}
            className={cn('relative shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition', tab === t.id ? 'text-ink-950' : 'bg-white/[0.06] text-muted hover:text-mist')}>
            {tab === t.id && <motion.span layoutId="library-tab" className="absolute inset-0 rounded-full bg-mist" transition={{ type: 'spring', stiffness: 450, damping: 34 }} />}
            <span className="relative">{t.label}</span>
          </button>
        ))}
      </div>

      <div role="tabpanel" className="mt-6">
        {!hydrated ? (
          <div className="grid grid-cols-2 gap-4 px-4 sm:grid-cols-4 sm:px-8">{Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="aspect-square rounded-xl" />)}</div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.2 }}>
              {tab === 'playlists' && (
                <Grid>
                  <Tile href="/library/liked" title="Liked Songs" subtitle={plural(liked.length, 'song')}
                    art={<div className="grid aspect-square place-items-center bg-gradient-to-br from-dusk-500 via-blush-500 to-rain-400"><Heart size={40} fill="white" className="text-white" /></div>} />
                  {playlists.map(p => (
                    <Tile key={p.id} href={`/library/playlist/${p.id}`} title={p.name} subtitle={`Playlist · ${plural(p.tracks.length, 'song')}`}
                      art={<Artwork art={{ palette: p.palette, pattern: 'waves', seed: p.createdAt % 997 }} label={p.name} className="aspect-square w-full" rounded="rounded-none" />} />
                  ))}
                  <motion.li variants={gridItem}>
                    <button type="button" onClick={() => useUIStore.getState().setCreatePlaylistOpen(true)} className="group block w-full rounded-2xl p-2.5 text-left transition hover:bg-white/[0.06]">
                      <div className="grid aspect-square place-items-center rounded-xl border-2 border-dashed border-white/15 text-faint transition group-hover:border-accent/60 group-hover:text-accent"><Plus size={36} /></div>
                      <p className="mt-3 font-semibold">Create playlist</p>
                      <p className="text-[0.8rem] text-muted">Start something new</p>
                    </button>
                  </motion.li>
                </Grid>
              )}
              {tab === 'albums' && (savedAlbums.length ? (
                <Grid>{savedAlbums.map(a => <Tile key={a.id} href={`/album/${a.id}`} title={a.title} subtitle={`${a.type} · ${artistNames(a.artists)}`} art={<Artwork art={a.artwork} className="aspect-square w-full" rounded="rounded-none" />} />)}</Grid>
              ) : <Empty title="No saved albums yet" body="Tap + on any album to keep it here." action={<Link href="/discover" className="btn-ghost">Discover albums</Link>} />)}
              {tab === 'artists' && (followedArtists.length ? (
                <div className="flex flex-wrap gap-1 px-2 sm:px-6">{followedArtists.map(a => <ArtistCard key={a.id} artist={a} />)}</div>
              ) : <Empty title="Follow your favourite artists" body="Hit Follow on an artist page and they'll appear here." action={<Link href="/discover" className="btn-ghost">Find artists</Link>} />)}
              {tab === 'recent' && (recent.length ? (
                <div className="px-2 sm:px-6">
                  <div className="mb-2 flex justify-end px-2">
                    <button type="button" onClick={() => useLibraryStore.getState().clearRecent()} className="chip py-1.5 text-xs"><Trash2 size={14} /> Clear history</button>
                  </div>
                  <TrackList tracks={recent} context={{ label: 'Recently played', href: '/library?tab=recent' }} showAlbum />
                </div>
              ) : <Empty title="Nothing played yet" body="Songs you play will show up here." action={<Link href="/" className="btn-ghost">Start listening</Link>} />)}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
