'use client';
import { AnimatePresence, motion } from 'motion/react';
import { Heart } from 'lucide-react';
import type { Track } from '@/types/music';
import { useIsLiked, useTrackActions } from '@/hooks/use-library';
import { cn } from '@/utils/format';

const BURST = Array.from({ length: 8 }, (_, i) => (i / 8) * Math.PI * 2);

/** Heart toggle with a spring pop and particle burst on like. */
export function LikeButton({ track, size = 18, className }: { track: Track; size?: number; className?: string }) {
  const liked = useIsLiked(track.id);
  const { toggleLike } = useTrackActions();
  return (
    <button
      type="button"
      aria-pressed={liked}
      aria-label={liked ? `Remove ${track.title} from Liked Songs` : `Add ${track.title} to Liked Songs`}
      onClick={e => { e.stopPropagation(); toggleLike(track); }}
      className={cn('icon-btn relative h-9 w-9', liked && 'text-blush-400 hover:text-blush-400', className)}
    >
      <motion.span key={String(liked)} initial={{ scale: liked ? 0.4 : 1 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 520, damping: 14 }} className="grid place-items-center">
        <Heart size={size} fill={liked ? 'currentColor' : 'none'} />
      </motion.span>
      <AnimatePresence>
        {liked && (
          <motion.span key="burst" className="pointer-events-none absolute inset-0" initial="hidden" animate="show" exit={{ opacity: 0 }}>
            {BURST.map(angle => (
              <motion.span
                key={angle}
                className="absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-full bg-blush-400"
                variants={{ hidden: { x: -3, y: -3, opacity: 1, scale: 1 }, show: { x: Math.cos(angle) * 18 - 3, y: Math.sin(angle) * 18 - 3, opacity: 0, scale: 0.4 } }}
                transition={{ duration: 0.55, ease: 'easeOut' }}
              />
            ))}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
