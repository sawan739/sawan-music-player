'use client';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'motion/react';
import { Disc3, Heart, HeartOff, ListEnd, ListPlus, ListStart, UserRound } from 'lucide-react';
import { useUIStore, type TrackMenu as TrackMenuState } from '@/store/ui-store';
import { useIsLiked, useTrackActions } from '@/hooks/use-library';
import { cn } from '@/utils/format';

type Item = { label: string; icon: React.ReactNode; onSelect: () => void; danger?: boolean };

/** Context menu for a track, positioned at the pointer/button and clamped to the viewport. */
export function TrackMenu() {
  const menu = useUIStore(s => s.trackMenu);
  const close = useUIStore(s => s.closeTrackMenu);
  useEffect(() => {
    if (!menu) return;
    const onScroll = () => close();
    window.addEventListener('resize', onScroll);
    document.getElementById('main')?.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('resize', onScroll); document.getElementById('main')?.removeEventListener('scroll', onScroll); };
  }, [menu, close]);
  // The panel gets a snapshot: during its exit animation the store value is already null.
  return <AnimatePresence>{menu && <MenuPanel key={`${menu.track.id}-${menu.x}-${menu.y}`} menu={menu} />}</AnimatePresence>;
}

function MenuPanel({ menu }: { menu: TrackMenuState }) {
  const { closeTrackMenu, openPlaylistPicker } = useUIStore.getState();
  const router = useRouter();
  const actions = useTrackActions();
  const liked = useIsLiked(menu.track.id);
  const panel = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ left: menu.x, top: menu.y, origin: 'top left' });

  useLayoutEffect(() => {
    const el = panel.current;
    if (!el) return;
    const { width, height } = el.getBoundingClientRect();
    const flipX = menu.x + width > window.innerWidth - 8;
    const flipY = menu.y + height > window.innerHeight - 8;
    setPos({
      left: Math.max(8, flipX ? menu.x - width : menu.x),
      top: Math.max(8, flipY ? menu.y - height : menu.y),
      origin: `${flipY ? 'bottom' : 'top'} ${flipX ? 'right' : 'left'}`,
    });
    el.querySelector<HTMLElement>('[role="menuitem"]')?.focus();
  }, [menu.x, menu.y]);

  const t = menu.track;
  const items: Item[] = [
    { label: 'Play next', icon: <ListStart size={17} />, onSelect: () => actions.playNext(t) },
    { label: 'Add to queue', icon: <ListEnd size={17} />, onSelect: () => actions.addToQueue([t]) },
    { label: 'Add to playlist…', icon: <ListPlus size={17} />, onSelect: () => openPlaylistPicker([t]) },
    { label: liked ? 'Remove from Liked Songs' : 'Add to Liked Songs', icon: liked ? <HeartOff size={17} /> : <Heart size={17} />, onSelect: () => actions.toggleLike(t) },
    ...(t.album ? [{ label: 'Go to album', icon: <Disc3 size={17} />, onSelect: () => router.push(`/album/${t.album!.id}`) }] : []),
    ...t.artists.slice(0, 2).map(a => ({ label: `Go to ${a.name}`, icon: <UserRound size={17} />, onSelect: () => router.push(`/artist/${a.id}`) })),
    ...(menu.extra ?? []).map(x => ({ ...x, icon: x.icon ?? null })),
  ];

  const onKeyDown = (e: React.KeyboardEvent) => {
    const els = [...(panel.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [])];
    const i = els.indexOf(document.activeElement as HTMLElement);
    if (e.key === 'ArrowDown') { e.preventDefault(); els[(i + 1) % els.length]?.focus(); }
    if (e.key === 'ArrowUp') { e.preventDefault(); els[(i - 1 + els.length) % els.length]?.focus(); }
    if (e.key === 'Escape' || e.key === 'Tab') { e.preventDefault(); closeTrackMenu(); }
  };

  return (
    <>
      <div className="fixed inset-0 z-[70]" onClick={closeTrackMenu} onContextMenu={e => { e.preventDefault(); closeTrackMenu(); }} />
      <motion.div
        ref={panel}
        role="menu"
        aria-label={`Options for ${t.title}`}
        onKeyDown={onKeyDown}
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.1 } }}
        transition={{ type: 'spring', damping: 26, stiffness: 420 }}
        style={{ left: pos.left, top: pos.top, transformOrigin: pos.origin }}
        className="glass-strong fixed z-[71] w-64 rounded-2xl p-1.5 shadow-2xl"
      >
        <p className="truncate px-3 pb-1.5 pt-1 text-xs font-semibold text-faint">{t.title}</p>
        {items.map(item => (
          <button
            key={item.label}
            type="button"
            role="menuitem"
            onClick={() => { closeTrackMenu(); item.onSelect(); }}
            className={cn('flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium outline-none transition hover:bg-white/[0.08] focus-visible:bg-white/[0.08]', item.danger ? 'text-blush-400' : 'text-mist')}
          >
            <span className="text-muted">{item.icon}</span>
            <span className="truncate">{item.label}</span>
          </button>
        ))}
      </motion.div>
    </>
  );
}
