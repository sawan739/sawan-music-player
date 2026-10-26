'use client';
import { useState } from 'react';
import { motion } from 'motion/react';
import { Repeat, Repeat1, Shuffle, SkipBack, SkipForward, Volume, Volume1, Volume2, VolumeX } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { PlayButton } from '@/components/music/play-button';
import { useProgress, useTransport } from '@/hooks/use-player';
import { usePlayerStore } from '@/store/player-store';
import { useShallow } from 'zustand/react/shallow';
import { cn, formatTime } from '@/utils/format';

/** Seek bar with drag-preview: the engine only seeks when the drag is released. */
export function SeekBar({ className, compact = false }: { className?: string; compact?: boolean }) {
  const { position, duration, seek } = useProgress();
  const [drag, setDrag] = useState<number | null>(null);
  const shown = drag ?? position;
  const known = duration > 0;
  return (
    <div className={cn('flex w-full items-center gap-3 text-[0.72rem] tabular-nums text-faint', className)}>
      {!compact && <span className="w-10 text-right">{formatTime(known ? shown : null)}</span>}
      <Slider
        className="flex-1"
        label="Seek"
        valueText={`${formatTime(shown)} of ${formatTime(duration)}`}
        value={known ? shown : 0}
        max={known ? duration : 1}
        step={0.5}
        disabled={!known}
        onChange={v => setDrag(v)}
        onCommit={v => { seek(v); setDrag(null); }}
      />
      {!compact && <span className="w-10">{formatTime(known ? duration : null)}</span>}
    </div>
  );
}

export function VolumeControl({ className }: { className?: string }) {
  const { volume, muted, setVolume, toggleMute } = usePlayerStore(useShallow(s => ({ volume: s.volume, muted: s.muted, setVolume: s.setVolume, toggleMute: s.toggleMute })));
  const level = muted ? 0 : volume;
  const Icon = level === 0 ? VolumeX : level < 0.33 ? Volume : level < 0.66 ? Volume1 : Volume2;
  return (
    <div className={cn('flex items-center gap-1', className)}>
      <button type="button" onClick={toggleMute} aria-label={muted ? 'Unmute' : 'Mute'} aria-pressed={muted} className="icon-btn h-9 w-9">
        <Icon size={18} />
      </button>
      <Slider className="w-24" label="Volume" valueText={`${Math.round(level * 100)}%`} value={level * 100} max={100} onChange={v => setVolume(v / 100)} />
    </div>
  );
}

function Toggle({ active, label, onClick, children, dot }: { active: boolean; label: string; onClick: () => void; children: React.ReactNode; dot?: boolean }) {
  return (
    <motion.button whileTap={{ scale: 0.85 }} type="button" aria-label={label} aria-pressed={active} onClick={onClick}
      className={cn('icon-btn relative', active && 'text-accent hover:text-accent')}>
      {children}
      {dot && active && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute bottom-1 h-1 w-1 rounded-full bg-accent" />}
    </motion.button>
  );
}

export function Transport({ size = 'md', className }: { size?: 'md' | 'lg'; className?: string }) {
  const t = useTransport();
  const playing = t.status === 'playing' || t.status === 'buffering';
  const loading = t.status === 'loading' || t.status === 'buffering';
  const big = size === 'lg';
  return (
    <div className={cn('flex items-center justify-center', big ? 'gap-3 sm:gap-6' : 'gap-2', className)}>
      <Toggle active={t.shuffle} label={t.shuffle ? 'Disable shuffle' : 'Enable shuffle'} onClick={t.toggleShuffle} dot><Shuffle size={big ? 22 : 18} /></Toggle>
      <motion.button whileTap={{ scale: 0.85, x: -3 }} type="button" aria-label="Previous track" onClick={t.previous} className={cn('icon-btn text-mist', big && 'h-12 w-12')}>
        <SkipBack size={big ? 28 : 20} fill="currentColor" />
      </motion.button>
      <PlayButton size={big ? 'xl' : 'md'} playing={playing} loading={loading && t.status === 'loading'} label={playing ? 'Pause' : 'Play'} onClick={t.togglePlay} />
      <motion.button whileTap={{ scale: 0.85, x: 3 }} type="button" aria-label="Next track" onClick={() => t.next()} className={cn('icon-btn text-mist', big && 'h-12 w-12')}>
        <SkipForward size={big ? 28 : 20} fill="currentColor" />
      </motion.button>
      <Toggle active={t.repeat !== 'off'} label={`Repeat: ${t.repeat === 'off' ? 'off' : t.repeat === 'all' ? 'all' : 'one'}`} onClick={t.cycleRepeat} dot>
        {t.repeat === 'one' ? <Repeat1 size={big ? 22 : 18} /> : <Repeat size={big ? 22 : 18} />}
      </Toggle>
    </div>
  );
}
