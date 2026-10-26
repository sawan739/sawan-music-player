'use client';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Heart, History } from 'lucide-react';
import type { Playlist } from '@/types/music';
import { Shelf } from '@/components/music/shelf';
import { TrackCards } from '@/components/music/cards';
import { Artwork } from '@/components/music/artwork';
import { useLibraryStore, selectLikedTracks } from '@/store/library-store';
import { useUIStore } from '@/store/ui-store';
import { useShallow } from 'zustand/react/shallow';
import { plural } from '@/utils/format';

/** Quick-access tiles: Liked Songs, your playlists and a few curated picks. */
export function QuickPicks({ playlists }: { playlists: Playlist[] }) {
  const hydrated = useUIStore(s => s.hydrated);
  const likedCount = useLibraryStore(s => Object.keys(s.liked).length);
  const mine = useLibraryStore(s => s.playlists).slice(0, 3);
  const tiles = [
    ...mine.map(p => ({ key: p.id, href: `/library/playlist/${p.id}`, title: p.name, art: <Artwork art={{ palette: p.palette, pattern: 'waves', seed: p.createdAt % 997 }} className="h-full w-full" rounded="rounded-none" /> })),
    ...playlists.map(p => ({ key: p.id, href: `/playlist/${p.id}`, title: p.title, art: <Artwork art={p.artwork} className="h-full w-full" rounded="rounded-none" /> })),
  ].slice(0, 5);

  return (
    <div className="grid grid-cols-2 gap-2 px-4 sm:px-8 lg:grid-cols-3">
      <QuickTile index={0} href="/library/liked" title="Liked Songs" subtitle={hydrated ? plural(likedCount, 'song') : ' '}
        art={<span className="grid h-full w-full place-items-center bg-gradient-to-br from-dusk-500 via-blush-500 to-rain-400"><Heart size={20} fill="white" className="text-white" /></span>} />
      {tiles.map((t, i) => <QuickTile key={t.key} index={i + 1} href={t.href} title={t.title} art={t.art} />)}
    </div>
  );
}

function QuickTile({ href, title, subtitle, art, index }: { href: string; title: string; subtitle?: string; art: React.ReactNode; index: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * index, duration: 0.4 }}>
      <Link href={href} className="group flex h-14 items-center gap-3 overflow-hidden rounded-xl bg-white/[0.06] pr-3 transition duration-300 hover:bg-white/[0.12] sm:h-16">
        <span className="h-full w-14 shrink-0 overflow-hidden shadow-card sm:w-16">{art}</span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-bold">{title}</span>
          {subtitle && <span className="block text-xs text-muted">{subtitle}</span>}
        </span>
      </Link>
    </motion.div>
  );
}

export function RecentlyPlayedShelf() {
  const hydrated = useUIStore(s => s.hydrated);
  const recent = useLibraryStore(s => s.recent);
  if (!hydrated || recent.length === 0) return null;
  return (
    <Shelf title="Recently played" subtitle="Jump back in" href="/library?tab=recent">
      <TrackCards tracks={recent.slice(0, 16)} context={{ label: 'Recently played', href: '/library?tab=recent' }} />
    </Shelf>
  );
}

export function LikedShelf() {
  const hydrated = useUIStore(s => s.hydrated);
  const liked = useLibraryStore(useShallow(selectLikedTracks));
  if (!hydrated || liked.length === 0) return null;
  return (
    <Shelf title="From your Liked Songs" href="/library/liked">
      <TrackCards tracks={liked.slice(0, 16)} context={{ label: 'Liked Songs', href: '/library/liked' }} />
    </Shelf>
  );
}

export function EmptyHistoryHint() {
  const hydrated = useUIStore(s => s.hydrated);
  const empty = useLibraryStore(s => s.recent.length === 0);
  if (!hydrated || !empty) return null;
  return (
    <div className="mx-4 flex items-center gap-4 rounded-2xl border border-dashed border-white/10 p-4 text-sm text-muted sm:mx-8">
      <History size={20} className="shrink-0 text-accent" />
      <p>Your listening history will show up here. Start with <Link href="/album/og-dil-ki-baarish" className="font-semibold text-mist underline-offset-2 hover:underline">Dil Ki Baarish</Link> — it plays instantly.</p>
    </div>
  );
}
