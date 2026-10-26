'use client';
import { Reorder, useDragControls } from 'motion/react';
import { GripVertical, X } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import type { Track } from '@/types/music';
import { TrackArtwork } from '@/components/music/artwork';
import { Equalizer } from '@/components/music/equalizer';
import { usePlayerStore } from '@/store/player-store';
import { artistNames, cn } from '@/utils/format';

const UPCOMING_LIMIT = 60;

function QueueItem({ track, queueIndex }: { track: Track; queueIndex: number }) {
  const controls = useDragControls();
  return (
    <Reorder.Item
      value={track}
      dragListener={false}
      dragControls={controls}
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16, height: 0 }}
      whileDrag={{ scale: 1.03, boxShadow: '0 18px 40px -12px rgba(0,0,0,.8)' }}
      className="group relative flex items-center gap-2 rounded-xl bg-ink-900/40 p-1.5 pr-1 hover:bg-white/[0.06]"
    >
      <button type="button" aria-label={`Reorder ${track.title}`} onPointerDown={e => controls.start(e)} className="cursor-grab touch-none p-1 text-faint hover:text-mist active:cursor-grabbing">
        <GripVertical size={16} />
      </button>
      <button type="button" onClick={() => usePlayerStore.getState().jumpTo(queueIndex)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
        <TrackArtwork track={track} className="h-10 w-10 shrink-0" rounded="rounded-md" />
        <span className="min-w-0">
          <span className="block truncate text-sm font-medium text-mist">{track.title}</span>
          <span className="block truncate text-xs text-muted">{artistNames(track.artists)}</span>
        </span>
      </button>
      <button type="button" aria-label={`Remove ${track.title} from queue`} onClick={() => usePlayerStore.getState().removeFromQueue(queueIndex)} className="icon-btn h-8 w-8 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100">
        <X size={15} />
      </button>
    </Reorder.Item>
  );
}

/** Now playing + drag-to-reorder upcoming tracks. */
export function QueueList({ className }: { className?: string }) {
  const { queue, index, context, status } = usePlayerStore(useShallow(s => ({ queue: s.queue, index: s.index, context: s.context, status: s.status })));
  const current = queue[index];
  const upcoming = queue.slice(index + 1, index + 1 + UPCOMING_LIMIT);
  const remaining = queue.length - index - 1;

  if (!current) return <p className={cn('px-2 py-10 text-center text-sm text-muted', className)}>Your queue is empty. Play something to get started.</p>;

  return (
    <div className={className}>
      <p className="px-1 text-xs font-semibold uppercase tracking-wider text-faint">Now playing</p>
      <div className="mt-2 flex items-center gap-3 rounded-xl bg-accent/10 p-2">
        <TrackArtwork track={current} className="h-12 w-12 shrink-0" rounded="rounded-md" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-accent">{current.title}</p>
          <p className="truncate text-xs text-muted">{artistNames(current.artists)}</p>
        </div>
        <Equalizer playing={status === 'playing'} className="mr-2" />
      </div>

      <div className="mt-6 flex items-center justify-between px-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-faint">
          Next {context ? <>from <span className="normal-case tracking-normal text-muted">{context.label}</span></> : 'up'}
        </p>
        {remaining > 0 && <button type="button" onClick={() => usePlayerStore.getState().clearUpcoming()} className="text-xs font-semibold text-muted hover:text-mist">Clear</button>}
      </div>
      {upcoming.length === 0 ? (
        <p className="px-1 py-6 text-sm text-muted">Nothing queued after this track.</p>
      ) : (
        <Reorder.Group axis="y" values={upcoming} onReorder={next => usePlayerStore.getState().setUpcoming(next)} className="mt-2 flex flex-col gap-1">
          {upcoming.map((t, i) => <QueueItem key={t.id} track={t} queueIndex={index + 1 + i} />)}
        </Reorder.Group>
      )}
      {remaining > UPCOMING_LIMIT && <p className="px-1 pt-3 text-xs text-faint">+ {remaining - UPCOMING_LIMIT} more</p>}
    </div>
  );
}
