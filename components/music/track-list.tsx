'use client';
import { memo, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Clock3, MoreHorizontal, Play } from 'lucide-react';
import type { PlayContext, Track } from '@/types/music';
import { TrackArtwork } from './artwork';
import { Equalizer } from './equalizer';
import { LikeButton } from './like-button';
import { useTrackState } from '@/hooks/use-player';
import { usePlayerStore } from '@/store/player-store';
import { useUIStore, type MenuExtra } from '@/store/ui-store';
import { cn, formatTime } from '@/utils/format';

type RowProps = {
  track: Track;
  index: number;
  numbered: boolean;
  showAlbum: boolean;
  onPlay: (index: number) => void;
  extraMenu?: (track: Track, index: number) => MenuExtra[];
};

export const TrackRow = memo(function TrackRow({ track, index, numbered, showAlbum, onPlay, extraMenu }: RowProps) {
  const { current, playing } = useTrackState(track.id);
  const openMenu = useUIStore(s => s.openTrackMenu);
  const menu = (x: number, y: number) => openMenu({ track, x, y, extra: extraMenu?.(track, index) });

  return (
    <motion.li
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index, 14) * 0.03, ease: [0.22, 1, 0.36, 1] }}
      onClick={() => onPlay(index)}
      onContextMenu={e => { e.preventDefault(); menu(e.clientX, e.clientY); }}
      className={cn(
        'group grid cursor-pointer grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-3 rounded-xl px-2 py-2 transition-colors duration-200 hover:bg-white/[0.06] sm:px-3',
        showAlbum && 'md:grid-cols-[2rem_minmax(0,1.4fr)_minmax(0,1fr)_auto]',
        current && 'bg-accent/[0.09] hover:bg-accent/[0.13]',
      )}
    >
      <span className="grid h-8 w-8 place-items-center text-sm tabular-nums text-faint">
        {current ? <Equalizer playing={playing} /> : (
          <>
            <span className={cn(numbered ? 'group-hover:hidden' : 'hidden')}>{index + 1}</span>
            <Play size={15} fill="currentColor" className={cn('text-mist', numbered ? 'hidden group-hover:block' : 'opacity-0 transition group-hover:opacity-100')} aria-hidden="true" />
          </>
        )}
      </span>

      <div className="flex min-w-0 items-center gap-3">
        {!numbered && <TrackArtwork track={track} className="h-11 w-11 shrink-0 shadow-card" rounded="rounded-lg" />}
        <div className="min-w-0">
          <button
            type="button"
            onClick={e => { e.stopPropagation(); onPlay(index); }}
            className={cn('block max-w-full truncate text-left text-[0.94rem] font-semibold', current ? 'text-accent' : 'text-mist')}
          >
            {track.title}
          </button>
          <p className="truncate text-[0.8rem] text-muted">
            {track.artists.map((a, i) => (
              <span key={a.id}>
                {i > 0 && ', '}
                <Link href={`/artist/${a.id}`} onClick={e => e.stopPropagation()} className="hover:text-mist hover:underline">{a.name}</Link>
              </span>
            ))}
          </p>
        </div>
      </div>

      {showAlbum && (
        <p className="hidden truncate text-sm text-muted md:block">
          {track.album ? <Link href={`/album/${track.album.id}`} onClick={e => e.stopPropagation()} className="hover:text-mist hover:underline">{track.album.title}</Link> : <span className="text-faint">Single</span>}
        </p>
      )}

      <div className="flex items-center gap-0.5 sm:gap-1">
        <LikeButton track={track} size={17} className={cn('sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100', 'aria-pressed:opacity-100')} />
        <span className="hidden w-12 text-right text-sm tabular-nums text-faint sm:block">{formatTime(track.duration)}</span>
        <button
          type="button"
          aria-label={`More options for ${track.title}`}
          onClick={e => { e.stopPropagation(); const r = e.currentTarget.getBoundingClientRect(); menu(r.right, r.bottom); }}
          className="icon-btn h-9 w-9"
        >
          <MoreHorizontal size={18} />
        </button>
      </div>
    </motion.li>
  );
});

type ListProps = {
  tracks: Track[];
  context?: PlayContext;
  /** Album style: track numbers instead of artwork. */
  numbered?: boolean;
  showAlbum?: boolean;
  showHeader?: boolean;
  extraMenu?: (track: Track, index: number) => MenuExtra[];
  className?: string;
};

export function TrackList({ tracks, context, numbered = false, showAlbum = false, showHeader = false, extraMenu, className }: ListProps) {
  const onPlay = useCallback((index: number) => usePlayerStore.getState().playTracks(tracks, index, context ?? null), [tracks, context]);
  return (
    <div className={className}>
      {showHeader && (
        <div className={cn('mb-1 grid grid-cols-[2rem_minmax(0,1fr)_auto] gap-3 border-b border-white/[0.07] px-2 pb-2 text-xs font-semibold uppercase tracking-wider text-faint sm:px-3', showAlbum && 'md:grid-cols-[2rem_minmax(0,1.4fr)_minmax(0,1fr)_auto]')}>
          <span className="text-center">#</span><span>Title</span>{showAlbum && <span className="hidden md:block">Album</span>}
          <span className="flex items-center justify-end gap-1 pr-[3.25rem]"><Clock3 size={14} aria-label="Duration" /></span>
        </div>
      )}
      <ol className="flex flex-col gap-0.5">
        {tracks.map((t, i) => (
          <TrackRow key={`${t.id}-${i}`} track={t} index={i} numbered={numbered} showAlbum={showAlbum} onPlay={onPlay} extraMenu={extraMenu} />
        ))}
      </ol>
    </div>
  );
}
