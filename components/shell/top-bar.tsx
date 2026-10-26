'use client';
import Link from 'next/link';
import { forwardRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion, useScroll, useTransform } from 'motion/react';
import { ChevronLeft, ChevronRight, Keyboard, Search, X } from 'lucide-react';
import { LogoMark } from '@/components/brand/logo';
import { useUIStore } from '@/store/ui-store';

type Props = { scrollRef: React.RefObject<HTMLElement | null> };

/** Sticky top bar that turns to glass as the page scrolls. Hosts the global search box. */
export const TopBar = forwardRef<HTMLInputElement, Props>(function TopBar({ scrollRef }, inputRef) {
  const router = useRouter();
  const pathname = usePathname();
  const query = useUIStore(s => s.searchQuery);
  const setQuery = useUIStore(s => s.setSearchQuery);
  const { scrollY } = useScroll({ container: scrollRef });
  const bg = useTransform(scrollY, [0, 80], ['rgba(9,11,20,0)', 'rgba(9,11,20,0.78)']);
  const border = useTransform(scrollY, [0, 80], ['rgba(255,255,255,0)', 'rgba(255,255,255,0.06)']);

  const onChange = (value: string) => {
    setQuery(value);
    if (pathname !== '/search') router.push('/search');
  };

  return (
    <motion.header style={{ backgroundColor: bg, borderColor: border }} className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b px-4 backdrop-blur-xl sm:px-8">
      <Link href="/" className="lg:hidden" aria-label="Sawan Music home"><LogoMark className="h-8 w-8" /></Link>
      <div className="hidden items-center gap-1 md:flex">
        <button type="button" aria-label="Go back" onClick={() => router.back()} className="icon-btn h-9 w-9 bg-black/30"><ChevronLeft size={20} /></button>
        <button type="button" aria-label="Go forward" onClick={() => router.forward()} className="icon-btn h-9 w-9 bg-black/30"><ChevronRight size={20} /></button>
      </div>

      <label className="group relative ml-1 hidden w-full max-w-md items-center md:flex">
        <Search size={18} className="pointer-events-none absolute left-4 text-faint transition group-focus-within:text-accent" />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={e => onChange(e.target.value)}
          onFocus={() => pathname !== '/search' && query && router.push('/search')}
          placeholder="Search songs, artists, albums…"
          aria-label="Search Sawan Music"
          className="h-11 w-full rounded-full border border-white/10 bg-white/[0.06] pl-11 pr-10 text-sm text-mist outline-none transition placeholder:text-faint focus:border-accent/50 focus:bg-white/[0.09] focus:shadow-glow [&::-webkit-search-cancel-button]:hidden"
        />
        {query && (
          <button type="button" aria-label="Clear search" onClick={() => setQuery('')} className="icon-btn absolute right-1 h-9 w-9"><X size={16} /></button>
        )}
      </label>

      <div className="ml-auto flex items-center gap-2">
        <Link href="/search" aria-label="Search" className="icon-btn md:hidden"><Search size={20} /></Link>
        <button type="button" aria-label="Keyboard shortcuts" onClick={() => useUIStore.getState().setShortcutsOpen(true)} className="icon-btn hidden md:inline-grid"><Keyboard size={19} /></button>
        <Link href="/library" className="flex items-center gap-2 rounded-full bg-black/30 p-1 pr-1 transition hover:bg-white/10 sm:pr-3.5" aria-label="Sawan's library">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-gradient font-display text-sm font-extrabold text-ink-950">S</span>
          <span className="hidden text-sm font-semibold sm:inline">Sawan</span>
        </Link>
      </div>
    </motion.header>
  );
});
