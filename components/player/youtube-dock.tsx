'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, useDragControls, useMotionValue } from 'motion/react';
import { GripHorizontal, Maximize2 } from 'lucide-react';
import { playback } from '@/services/audio/playback-controller';
import { currentTrackOf, usePlayerStore } from '@/store/player-store';
import { useUIStore } from '@/store/ui-store';

type Rect = { left: number; top: number; width: number; height: number };
const same = (a: Rect | null, b: Rect) => !!a && Math.abs(a.left - b.left) < 0.5 && Math.abs(a.top - b.top) < 0.5 && Math.abs(a.width - b.width) < 0.5 && Math.abs(a.height - b.height) < 0.5;

/**
 * The one and only YouTube iframe. It is never unmounted (re-parenting an iframe reloads it);
 * instead it is positioned either as a draggable 200×200 mini player, or over the
 * <VideoSlot/> inside Now Playing. YouTube requires the player to remain visible.
 */
export function YouTubeDock() {
  const isYouTube = usePlayerStore(s => currentTrackOf(s)?.source.kind === 'youtube');
  const nowPlayingOpen = useUIStore(s => s.nowPlayingOpen);
  const slot = useUIStore(s => s.videoSlot);
  const [rect, setRect] = useState<Rect | null>(null);
  const hostRef = useCallback((el: HTMLDivElement | null) => playback.setYouTubeHost(el), []);
  const bounds = useRef<HTMLDivElement>(null);
  const controls = useDragControls();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const savedOffset = useRef({ x: 0, y: 0 });

  // Follow the slot every frame while Now Playing is open (it animates in with a spring).
  useEffect(() => {
    if (!nowPlayingOpen || !slot) { setRect(null); return; }
    let frame = 0;
    const loop = () => {
      const r = slot.getBoundingClientRect();
      const next = { left: r.left, top: r.top, width: r.width, height: r.height };
      setRect(prev => (same(prev, next) ? prev : next));
      frame = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(frame);
  }, [nowPlayingOpen, slot]);

  const docked = isYouTube && !!rect;
  useEffect(() => {
    if (docked) { savedOffset.current = { x: x.get(), y: y.get() }; x.set(0); y.set(0); }
    else { x.set(savedOffset.current.x); y.set(savedOffset.current.y); }
  }, [docked, x, y]);

  const style: React.CSSProperties = docked
    ? { position: 'fixed', left: rect!.left, top: rect!.top, width: rect!.width, height: rect!.height, zIndex: 55 }
    : isYouTube
      ? { position: 'fixed', zIndex: 35 }
      : { position: 'fixed', left: -10000, top: 0, width: 200, height: 200, zIndex: -1 };

  return (
    <>
      <div ref={bounds} className="pointer-events-none fixed inset-x-2 bottom-[8.75rem] top-16 md:bottom-24" aria-hidden="true" />
      <motion.div
        drag={!docked && isYouTube}
        dragControls={controls}
        dragListener={false}
        dragMomentum={false}
        dragConstraints={bounds}
        dragElastic={0.08}
        style={{ ...style, x, y }}
        className={docked ? 'overflow-hidden rounded-2xl' : isYouTube ? 'bottom-[9.25rem] right-3 overflow-hidden rounded-2xl border border-white/15 bg-black shadow-[0_24px_60px_-12px_rgba(0,0,0,.9)] md:bottom-28 md:right-5' : ''}
        role="region"
        aria-label="YouTube video player"
      >
        {isYouTube && !docked && (
          <div className="flex h-7 items-center justify-between bg-ink-800/95 pl-2 pr-1 text-faint">
            <button
              type="button"
              onPointerDown={e => controls.start(e)}
              className="flex h-full flex-1 cursor-grab touch-none items-center gap-1.5 text-[0.68rem] font-semibold uppercase tracking-wider active:cursor-grabbing"
              aria-label="Drag to move the video player"
            >
              <GripHorizontal size={14} /> Drag
            </button>
            <button type="button" aria-label="Open Now Playing" onClick={() => useUIStore.getState().setNowPlaying(true)} className="icon-btn h-6 w-6">
              <Maximize2 size={13} />
            </button>
          </div>
        )}
        <div ref={hostRef} className={docked ? 'h-full w-full' : 'h-[200px] w-[200px]'} />
      </motion.div>
    </>
  );
}

/** Placeholder inside Now Playing that the YouTube dock positions itself over. */
export function VideoSlot({ className }: { className?: string }) {
  const setSlot = useUIStore(s => s.setVideoSlot);
  const ref = useCallback((el: HTMLDivElement | null) => setSlot(el), [setSlot]);
  return <div ref={ref} className={className} aria-hidden="true" />;
}
