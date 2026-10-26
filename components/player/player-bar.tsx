'use client';
import Link from 'next/link';
import { useLayoutEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useAnimation } from 'motion/react';
import { ChevronUp, ListMusic, Music2 } from 'lucide-react';
import { TrackArtwork } from '@/components/music/artwork';
import { LikeButton } from '@/components/music/like-button';
import { PlayButton } from '@/components/music/play-button';
import { SeekBar, Transport, VolumeControl } from './controls';
import { useCurrentTrack } from '@/hooks/use-player';
import { usePlayerStore } from '@/store/player-store';
import { useUIStore } from '@/store/ui-store';
import { cn } from '@/utils/format';
import type { Track } from '@/types/music';

/** Scrolls overflowing text back and forth, only while `active`. */
export function Marquee({ text, active, className }: { text: string; active: boolean; className?: string }) {
  const outer = useRef<HTMLSpanElement>(null);
  const inner = useRef<HTMLSpanElement>(null);
  const [distance, setDistance] = useState(0);
  useLayoutEffect(() => {
    const o = outer.current, i = inner.current;
    if (o && i) setDistance(Math.max(0, i.scrollWidth - o.clientWidth));
  }, [text]);
  return (
    <span ref={outer} className={cn('block overflow-hidden whitespace-nowrap', distance > 0 && active && 'mask-fade-x', className)}>
      <span ref={inner} className={cn('inline-block', distance > 0 && active && 'animate-marquee')} style={{ '--marquee-distance': `-${distance}px` } as React.CSSProperties}>
        {text}
      </span>
    </span>
  );
}

function TrackInfo({ track }: { track: Track }) {
  const playing = usePlayerStore(s => s.status === 'playing');
  const error = usePlayerStore(s => (s.status === 'error' ? s.error : null));
  return (
    <div className="min-w-0">
      <Marquee text={track.title} active={playing} className="text-sm font-semibold text-mist" />
      {error ? (
        <p className="truncate text-xs text-blush-400" role="status">{error}</p>
      ) : (
        <p className="truncate text-xs text-muted">
          {track.artists.map((a, i) => <span key={a.id}>{i > 0 && ', '}<Link href={`/artist/${a.id}`} className="hover:text-mist hover:underline">{a.name}</Link></span>)}
        </p>
      )}
    </div>
  );
}

function ProgressLine() {
  const ratio = usePlayerStore(s => (s.duration > 0 ? s.position / s.duration : 0));
  return (
    <div className="absolute inset-x-3 bottom-0 h-[2px] overflow-hidden rounded-full bg-white/10">
      <div className="h-full w-full origin-left bg-gradient-to-r from-rain-400 to-accent" style={{ transform: `scaleX(${ratio})` }} />
    </div>
  );
}

/** Mobile mini-player: tap to expand, swipe sideways to skip. */
function MiniPlayer({ track }: { track: Track }) {
  const status = usePlayerStore(s => s.status);
  const playing = status === 'playing' || status === 'buffering';
  const setNowPlaying = useUIStore(s => s.setNowPlaying);
  const controls = useAnimation();
  return (
    <motion.div initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }} transition={{ type: 'spring', damping: 26, stiffness: 300 }} className="px-2 pb-1.5 md:hidden">
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.5}
        animate={controls}
        onDragEnd={(_, info) => {
          const s = usePlayerStore.getState();
          if (info.offset.x < -70) s.next(); else if (info.offset.x > 70) s.previous();
          void controls.start({ x: 0 });
        }}
        onTap={e => { if (!(e.target as HTMLElement).closest('button')) setNowPlaying(true); }}
        className="glass-strong relative flex cursor-pointer items-center gap-3 rounded-2xl p-2 pr-2.5 shadow-card"
      >
        <TrackArtwork track={track} className="h-11 w-11 shrink-0" rounded="rounded-lg" />
        <div className="min-w-0 flex-1"><TrackInfo track={track} /></div>
        <div className="flex items-center">
          <LikeButton track={track} size={18} />
          <PlayButton size="sm" playing={playing} loading={status === 'loading'} label={playing ? 'Pause' : 'Play'} onClick={() => usePlayerStore.getState().togglePlay()} />
        </div>
        <ProgressLine />
      </motion.div>
    </motion.div>
  );
}

export function PlayerBar() {
  const track = useCurrentTrack();
  const hydrated = useUIStore(s => s.hydrated);
  const { setNowPlaying, setQueueOpen } = useUIStore.getState();
  const queueOpen = useUIStore(s => s.queueOpen);

  return (
    <>
      <AnimatePresence>{hydrated && track && <MiniPlayer key="mini" track={track} />}</AnimatePresence>

      <footer className="glass-strong relative z-30 hidden h-[5.75rem] grid-cols-[minmax(0,1fr)_minmax(0,40rem)_minmax(0,1fr)] items-center gap-4 border-x-0 border-b-0 px-4 md:grid lg:px-6" aria-label="Player">
        <div className="flex min-w-0 items-center gap-3">
          {track ? (
            <>
              <button type="button" onClick={() => setNowPlaying(true)} aria-label="Open Now Playing" className="group relative shrink-0">
                <TrackArtwork track={track} className="h-14 w-14 shadow-card transition duration-300 group-hover:brightness-75" rounded="rounded-lg" />
                <ChevronUp size={22} className="absolute inset-0 m-auto text-white opacity-0 transition group-hover:opacity-100" />
              </button>
              <TrackInfo track={track} />
              <LikeButton track={track} size={18} />
            </>
          ) : (
            <div className="flex items-center gap-3 text-sm text-faint">
              <span className="grid h-14 w-14 place-items-center rounded-lg bg-white/5"><Music2 size={20} /></span>
              Pick something to play
            </div>
          )}
        </div>

        <div className="flex flex-col items-center gap-1">
          <Transport />
          <SeekBar />
        </div>

        <div className="flex items-center justify-end gap-1">
          <button type="button" aria-label="Queue" aria-pressed={queueOpen} onClick={() => setQueueOpen(!queueOpen)} className={cn('icon-btn', queueOpen && 'text-accent hover:text-accent')}>
            <ListMusic size={19} />
          </button>
          <VolumeControl className="hidden lg:flex" />
          <button type="button" aria-label="Open Now Playing" onClick={() => setNowPlaying(true)} disabled={!track} className="icon-btn disabled:opacity-40">
            <ChevronUp size={20} />
          </button>
        </div>
      </footer>
    </>
  );
}
