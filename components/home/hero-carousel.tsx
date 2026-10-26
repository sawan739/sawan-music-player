'use client';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import type { Album, Playlist } from '@/types/music';
import { Artwork } from '@/components/music/artwork';
import { PlayButton } from '@/components/music/play-button';
import { useIsPlayingContext, usePlayCollection } from '@/hooks/use-play-collection';
import { usePlayerStore } from '@/store/player-store';
import { artistNames, cn } from '@/utils/format';

type Item = { kind: 'album'; item: Album } | { kind: 'playlist'; item: Playlist };
const INTERVAL = 7000;

function Slide({ entry }: { entry: Item }) {
  const { kind, item } = entry;
  const href = `/${kind}/${item.id}`;
  const context = useMemo(() => ({ label: item.title, href }), [item.title, href]);
  const { play, loading } = usePlayCollection(kind, item.id, context);
  const playing = useIsPlayingContext(item.title);
  const [a, b, c] = item.artwork.palette;
  const eyebrow = kind === 'album' ? `New ${item.type.toLowerCase()} · ${artistNames(item.artists)}` : 'Featured playlist';

  return (
    <div className="relative flex h-full items-center overflow-hidden rounded-3xl" style={{ background: `linear-gradient(120deg, ${c} 0%, ${b} 60%, ${a} 130%)` }}>
      <div className="absolute -right-10 -top-16 h-72 w-72 rounded-full opacity-50 blur-3xl" style={{ background: a }} aria-hidden="true" />
      <div className="relative z-10 flex w-full items-center gap-6 p-6 sm:p-10">
        <div className="min-w-0 flex-1">
          <motion.p initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="text-xs font-bold uppercase tracking-[0.25em] text-white/80">{eyebrow}</motion.p>
          <motion.h2 initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.18, type: 'spring', stiffness: 120, damping: 18 }} className="mt-3 font-display text-4xl font-extrabold leading-[1.02] tracking-tight text-white sm:text-6xl">{item.title}</motion.h2>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-3 line-clamp-2 max-w-lg text-sm text-white/80 sm:text-base">{item.description}</motion.p>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38 }} className="mt-6 flex items-center gap-3">
            <PlayButton size="lg" playing={playing} loading={loading} label={playing ? `Pause ${item.title}` : `Play ${item.title}`} onClick={() => (playing ? usePlayerStore.getState().pause() : play())} tone="light" />
            <Link href={href} className="btn border border-white/30 px-5 py-3 text-sm text-white hover:bg-white/10">Open <ArrowRight size={16} /></Link>
          </motion.div>
        </div>
        <motion.div initial={{ opacity: 0, scale: 0.8, rotate: 6 }} animate={{ opacity: 1, scale: 1, rotate: -3 }} transition={{ delay: 0.15, type: 'spring', stiffness: 100, damping: 14 }} className="hidden w-56 shrink-0 md:block lg:w-64">
          <Artwork art={item.artwork} className="aspect-square w-full shadow-[0_30px_60px_-15px_rgba(0,0,0,.7)]" label={kind === 'playlist' ? item.title : undefined} />
        </motion.div>
      </div>
    </div>
  );
}

/** Auto-advancing featured carousel. Pauses on hover/focus and while the tab is hidden. */
export function HeroCarousel({ items }: { items: Item[] }) {
  const [[index, direction], setState] = useState<[number, number]>([0, 1]);
  const [paused, setPaused] = useState(false);
  const go = (next: number, dir: number) => setState([(next + items.length) % items.length, dir]);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => { if (!document.hidden) setState(([i]) => [(i + 1) % items.length, 1]); }, INTERVAL);
    return () => clearInterval(id);
  }, [paused, items.length]);

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured"
      className="relative px-4 sm:px-8"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="relative h-[19rem] sm:h-[20rem]">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={index}
            custom={direction}
            variants={{ enter: (d: number) => ({ x: `${d * 12}%`, opacity: 0, scale: 0.97 }), center: { x: 0, opacity: 1, scale: 1 }, exit: (d: number) => ({ x: `${d * -12}%`, opacity: 0, scale: 0.97 }) }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 220, damping: 30 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.25}
            onDragEnd={(_, info) => { if (info.offset.x < -60) go(index + 1, 1); else if (info.offset.x > 60) go(index - 1, -1); }}
            className="absolute inset-0"
            role="group"
            aria-roledescription="slide"
            aria-label={`${index + 1} of ${items.length}`}
          >
            <Slide entry={items[index]} />
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="mt-4 flex items-center justify-center gap-2">
        {items.map((it, i) => (
          <button key={it.item.id} type="button" aria-label={`Show ${it.item.title}`} aria-current={i === index} onClick={() => go(i, i > index ? 1 : -1)} className="group grid h-6 place-items-center px-0.5">
            <span className={cn('block h-1.5 rounded-full transition-all duration-500', i === index ? 'w-8 bg-accent' : 'w-1.5 bg-white/25 group-hover:bg-white/50')} />
          </button>
        ))}
      </div>
    </section>
  );
}
