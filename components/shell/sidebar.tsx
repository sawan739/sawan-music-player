'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'motion/react';
import { Heart, Plus } from 'lucide-react';
import { Logo } from '@/components/brand/logo';
import { Artwork } from '@/components/music/artwork';
import { NAV_ITEMS, isActive } from './nav';
import { useLibraryStore } from '@/store/library-store';
import { usePlayerStore } from '@/store/player-store';
import { useUIStore } from '@/store/ui-store';
import { cn, plural } from '@/utils/format';

export function Sidebar() {
  const pathname = usePathname();
  const playlists = useLibraryStore(s => s.playlists);
  const likedCount = useLibraryStore(s => Object.keys(s.liked).length);
  const playing = usePlayerStore(s => s.status === 'playing');
  const playingFrom = usePlayerStore(s => s.context?.href);

  return (
    <aside className="hidden w-[17rem] shrink-0 flex-col gap-2 p-2 pr-0 lg:flex" aria-label="Sidebar">
      <div className="glass rounded-2xl px-3 pb-3 pt-5">
        <Link href="/" className="mb-5 block px-3" aria-label="Sawan Music home">
          <span data-playing={playing}><Logo animated /></span>
        </Link>
        <nav aria-label="Main">
          <ul className="space-y-0.5">
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
              const active = isActive(pathname, href);
              return (
                <li key={href} className="relative">
                  {active && <motion.span layoutId="sidebar-active" className="absolute inset-0 rounded-xl bg-white/[0.08]" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
                  <Link href={href} aria-current={active ? 'page' : undefined} className={cn('relative flex items-center gap-3.5 rounded-xl px-3 py-2.5 text-[0.95rem] font-semibold transition', active ? 'text-mist' : 'text-muted hover:text-mist')}>
                    <Icon size={20} className={active ? 'text-accent' : ''} /> {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      <div className="glass flex min-h-0 flex-1 flex-col rounded-2xl">
        <div className="flex items-center justify-between px-5 pb-2 pt-4">
          <Link href="/library" className="text-sm font-bold text-muted transition hover:text-mist">Your Library</Link>
          <button type="button" onClick={() => useUIStore.getState().setCreatePlaylistOpen(true)} aria-label="Create playlist" className="icon-btn h-8 w-8"><Plus size={18} /></button>
        </div>
        <ul className="min-h-0 flex-1 space-y-0.5 overflow-y-auto px-2 pb-3">
          <li>
            <Link href="/library/liked" className={cn('flex items-center gap-3 rounded-xl p-2 transition hover:bg-white/[0.06]', pathname === '/library/liked' && 'bg-white/[0.08]')}>
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-dusk-500 via-blush-500 to-rain-400 shadow-card"><Heart size={18} fill="white" className="text-white" /></span>
              <span className="min-w-0">
                <span className={cn('block truncate text-sm font-semibold', playingFrom === '/library/liked' ? 'text-accent' : 'text-mist')}>Liked Songs</span>
                <span className="block text-xs text-muted">Playlist · {plural(likedCount, 'song')}</span>
              </span>
            </Link>
          </li>
          {playlists.map(p => {
            const href = `/library/playlist/${p.id}`;
            return (
              <li key={p.id}>
                <Link href={href} className={cn('flex items-center gap-3 rounded-xl p-2 transition hover:bg-white/[0.06]', pathname === href && 'bg-white/[0.08]')}>
                  <Artwork art={{ palette: p.palette, pattern: 'waves', seed: p.createdAt % 997 }} className="h-11 w-11 shrink-0" rounded="rounded-lg" />
                  <span className="min-w-0">
                    <span className={cn('block truncate text-sm font-semibold', playingFrom === href ? 'text-accent' : 'text-mist')}>{p.name}</span>
                    <span className="block text-xs text-muted">Playlist · {plural(p.tracks.length, 'song')}</span>
                  </span>
                </Link>
              </li>
            );
          })}
          {playlists.length === 0 && (
            <li className="m-2 rounded-xl bg-white/[0.04] p-4">
              <p className="text-sm font-semibold">Create your first playlist</p>
              <p className="mt-1 text-xs text-muted">It&apos;s easy — we&apos;ll help you.</p>
              <button type="button" onClick={() => useUIStore.getState().setCreatePlaylistOpen(true)} className="btn mt-3 bg-mist px-4 py-1.5 text-xs text-ink-950 hover:bg-white">Create playlist</button>
            </li>
          )}
        </ul>
        <p className="border-t border-white/[0.06] px-5 py-3 text-[0.7rem] text-faint">Made with ♥ for Sawan</p>
      </div>
    </aside>
  );
}
