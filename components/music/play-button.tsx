'use client';
import { AnimatePresence, motion } from 'motion/react';
import { Loader2, Pause, Play } from 'lucide-react';
import { cn } from '@/utils/format';

type Props = {
  playing: boolean;
  loading?: boolean;
  onClick: (e: React.MouseEvent) => void;
  label: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  tone?: 'rain' | 'light';
  className?: string;
};

const SIZES = { sm: ['h-9 w-9', 16], md: ['h-11 w-11', 19], lg: ['h-14 w-14', 24], xl: ['h-[4.5rem] w-[4.5rem]', 30] } as const;

/** Circular play/pause button with an animated icon morph. */
export function PlayButton({ playing, loading, onClick, label, size = 'md', tone = 'rain', className }: Props) {
  const [box, icon] = SIZES[size];
  const state = loading ? 'loading' : playing ? 'pause' : 'play';
  return (
    <motion.button
      type="button"
      aria-label={label}
      onClick={onClick}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
      className={cn('relative grid shrink-0 place-items-center rounded-full text-ink-950', tone === 'rain' ? 'bg-rain-400 shadow-glow-rain' : 'bg-white shadow-[0_10px_30px_-8px_rgba(255,255,255,.5)]', box, className)}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={state}
          initial={{ scale: 0.3, opacity: 0, rotate: -40 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          exit={{ scale: 0.3, opacity: 0, rotate: 40 }}
          transition={{ duration: 0.18 }}
          className="grid place-items-center"
        >
          {state === 'loading' ? <Loader2 size={icon} className="animate-spin" /> : state === 'pause' ? <Pause size={icon} fill="currentColor" /> : <Play size={icon} fill="currentColor" className="translate-x-[1.5px]" />}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}
