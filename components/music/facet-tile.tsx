'use client';
import Link from 'next/link';
import { motion } from 'motion/react';
import type { FacetInfo } from '@/types/music';
import { Artwork } from './artwork';
import { cn } from '@/utils/format';

/** Colourful browse tile for a genre, mood or language, with a tilted artwork peeking out. */
export function FacetTile({ facet, index = 0, compact = false }: { facet: FacetInfo; index?: number; compact?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: Math.min(index, 12) * 0.035, duration: 0.4 }}
      whileHover={{ y: -4 }}
    >
      <Link
        href={`/discover/${facet.facet}/${facet.id}`}
        className={cn('group relative block overflow-hidden rounded-2xl p-4 shadow-card', compact ? 'h-24' : 'h-32 sm:h-36')}
        style={{ background: `linear-gradient(135deg, ${facet.palette[1]}, ${facet.palette[2]})` }}
      >
        <span className="relative z-10 font-display text-lg font-extrabold tracking-tight text-white sm:text-xl">{facet.name}</span>
        {!compact && <span className="relative z-10 mt-1 line-clamp-2 block max-w-[70%] text-xs text-white/75">{facet.description}</span>}
        <Artwork
          art={{ palette: facet.palette, pattern: facet.pattern, seed: facet.id.length * 17 }}
          className={cn('absolute -bottom-3 -right-4 rotate-[22deg] shadow-[0_10px_30px_rgba(0,0,0,.45)] transition duration-500 group-hover:rotate-[14deg] group-hover:scale-110', compact ? 'h-16 w-16' : 'h-24 w-24')}
          rounded="rounded-lg"
        />
      </Link>
    </motion.div>
  );
}
