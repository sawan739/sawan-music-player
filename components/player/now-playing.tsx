'use client';
import Link from 'next/link';
import { AnimatePresence, motion, useDragControls } from 'motion/react';
import { AlertTriangle, ChevronDown, ListMusic, ListPlus, MoreHorizontal, RotateCcw, SkipForward } from 'lucide-react';
import type { Track } from '@/types/music';
import { Artwork, TrackArtwork } from '@/components/music/artwork';
import { LikeButton } from '@/components/music/like-button';
import { Vinyl } from '@/components/music/vinyl';
import { SeekBar, Transport, VolumeControl } from './controls';
import { QueueList } from './queue-list';
import { VideoSlot } from './youtube-dock';
import { useCurrentTrack } from '@/hooks/use-player';
import { usePlayerStore } from '@/store/player-store';
import { useUIStore } from '@/store/ui-store';
import { cn } from '@/utils/format';

function Visual({ track, playing }: { track: Track; playing: boolean }) {
  if (track.source.kind === 'youtube') {
    return (
      <div className="relative w-full max-w-[34rem]">
        <div className="absolute -inset-6 rounded-[2rem] bg-accent/20 blur-3xl" aria-hidden="true" />
        {/* The YouTube dock positions the live player over this slot; min 200px per YouTube's terms. */}
        <VideoSlot className="relative aspect-square min-h-[200px] w-full rounded-2xl bg-black/40 shadow-card sm:aspect-video" />
      </div>
    );
  }
  return (
    <div className="relative aspect-square w-[min(72vw,22rem)] lg:w-[min(30vw,26rem)]">
      {playing && <span className="absolute inset-0 animate-pulse-ring rounded-3xl border-2 border-accent/40" aria-hidden="true" />}
      <motion.div className="absolute inset-[4%] -z-0" animate={{ x: playing ? '22%' : '0%', rotate: playing ? 0 : -8 }} transition={{ type: 'spring', stiffness: 120, damping: 18 }}>
        <Vinyl palette={track.artwork.palette} playing={playing} className="h-full w-full" />
      </motion.div>
      <motion.div className="relative" animate={{ scale: playing ? 1 : 0.94, x: playing ? '-6%' : '0%' }} transition={{ type: 'spring', stiffness: 160, damping: 20 }}>
        <TrackArtwork track={track} rounded="rounded-3xl" className="aspect-square w-full shadow-[0_40px_80px_-25px_rgba(0,0,0,.9)]" />
      </motion.div>
    </div>
  );
}

function ErrorBanner() {
  const error = usePlayerStore(s => (s.status === 'error' ? s.error : null));
  if (!error) return null;
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} role="alert" className="flex w-full max-w-md items-center gap-3 rounded-xl border border-blush-400/30 bg-blush-500/10 px-3 py-2 text-sm text-blush-400">
      <AlertTriangle size={18} className="shrink-0" />
      <span className="flex-1">{error}</span>
      <button type="button" onClick={() => usePlayerStore.getState().play()} className="icon-btn h-8 w-8 text-blush-400" aria-label="Retry"><RotateCcw size={16} /></button>
      <button type="button" onClick={() => usePlayerStore.getState().next()} className="icon-btn h-8 w-8 text-blush-400" aria-label="Skip"><SkipForward size={16} /></button>
    </motion.div>
  );
}

export function NowPlaying() {
  const open = useUIStore(s => s.nowPlayingOpen);
  const track = useCurrentTrack();
  return <AnimatePresence>{open && track && <Sheet key="np" track={track} />}</AnimatePresence>;
}

function Sheet({ track }: { track: Track }) {
  const { setNowPlaying, setQueueOpen, openPlaylistPicker, openTrackMenu } = useUIStore.getState();
  const status = usePlayerStore(s => s.status);
  const context = usePlayerStore(s => s.context);
  const playing = status === 'playing' || status === 'buffering';
  const drag = useDragControls();
  const close = () => setNowPlaying(false);

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={`Now playing: ${track.title}`}
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 34, stiffness: 300 }}
      drag="y"
      dragControls={drag}
      dragListener={false}
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={{ top: 0, bottom: 0.7 }}
      onDragEnd={(_, info) => { if (info.offset.y > 140 || info.velocity.y > 700) close(); }}
      data-playing={playing}
      className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-ink-950"
    >
      {/* Ambient backdrop from the track's artwork */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <Artwork art={track.artwork} rounded="rounded-none" className="absolute inset-0 scale-125 opacity-60 blur-[90px] saturate-150" />
        <div className="absolute -left-1/4 top-1/4 h-[60vmax] w-[60vmax] animate-drift rounded-full opacity-40 blur-[100px] anim-when-playing" style={{ background: track.artwork.palette[0] }} />
        <div className="absolute inset-0 bg-gradient-to-b from-ink-950/40 via-ink-950/60 to-ink-950" />
        <div className="absolute inset-x-0 bottom-0 flex h-28 items-end justify-center gap-1.5 opacity-20">
          {Array.from({ length: 40 }, (_, i) => (
            <span key={i} className="anim-when-playing h-full w-1.5 origin-bottom animate-eq rounded-t-full bg-accent" style={{ animationDelay: `${(i * -0.137) % 1.2}s`, animationDuration: `${0.8 + ((i * 7) % 5) * 0.15}s` }} />
          ))}
        </div>
      </div>

      <header onPointerDown={e => drag.start(e)} className="relative z-10 flex touch-none items-center gap-2 px-3 pt-[max(env(safe-area-inset-top),0.75rem)] sm:px-6">
        <button type="button" autoFocus aria-label="Close Now Playing" onClick={close} className="icon-btn text-mist"><ChevronDown size={26} /></button>
        <div className="min-w-0 flex-1 text-center">
          <span className="mx-auto mb-1 block h-1 w-10 rounded-full bg-white/25 sm:hidden" aria-hidden="true" />
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.25em] text-muted">Playing from</p>
          {context?.href ? (
            <Link href={context.href} onClick={close} className="block truncate text-sm font-semibold text-mist hover:underline">{context.label}</Link>
          ) : (
            <p className="truncate text-sm font-semibold text-mist">{context?.label ?? 'Sawan Music'}</p>
          )}
        </div>
        <button type="button" aria-label="More options" onClick={e => { const r = e.currentTarget.getBoundingClientRect(); openTrackMenu({ track, x: r.right, y: r.bottom }); }} className="icon-btn text-mist">
          <MoreHorizontal size={22} />
        </button>
      </header>

      <div className="relative z-10 grid min-h-0 flex-1 lg:grid-cols-[minmax(0,1fr)_25rem]">
        <div className="flex min-h-0 flex-col items-center justify-center gap-6 overflow-y-auto px-6 py-6 sm:gap-8">
          <Visual track={track} playing={playing} />

          <div className="w-full max-w-md">
            <div className="flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <AnimatePresence mode="wait">
                  <motion.div key={track.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>
                    <h2 className="truncate font-display text-2xl font-extrabold tracking-tight text-white sm:text-3xl">{track.title}</h2>
                    <p className="truncate text-base text-muted">
                      {track.artists.map((a, i) => <span key={a.id}>{i > 0 && ', '}<Link href={`/artist/${a.id}`} onClick={close} className="hover:text-mist hover:underline">{a.name}</Link></span>)}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>
              <LikeButton track={track} size={24} className="h-11 w-11" />
            </div>
            <SeekBar className="mt-5" />
            <Transport size="lg" className="mt-3" />
            <div className="mt-5 flex items-center justify-between">
              <button type="button" onClick={() => openPlaylistPicker([track])} className="chip py-1.5 text-xs"><ListPlus size={15} /> Add to playlist</button>
              <VolumeControl className="hidden sm:flex" />
              <button type="button" onClick={() => setQueueOpen(true)} className={cn('chip py-1.5 text-xs lg:hidden')}><ListMusic size={15} /> Queue</button>
            </div>
          </div>
          <ErrorBanner />
        </div>

        <aside className="hidden min-h-0 flex-col border-l border-white/[0.06] bg-ink-950/30 lg:flex" aria-label="Up next">
          <h3 className="px-6 pb-2 pt-6 font-display text-lg font-bold">Up next</h3>
          <QueueList className="min-h-0 flex-1 overflow-y-auto px-4 pb-8" />
        </aside>
      </div>
    </motion.div>
  );
}
