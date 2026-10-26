'use client';
import { motion } from 'motion/react';
import type { Palette } from '@/types/music';
import { cn } from '@/utils/format';

type Props = {
  palette: Palette;
  art: React.ReactNode;
  eyebrow: string;
  title: string;
  description?: React.ReactNode;
  meta?: React.ReactNode;
  round?: boolean;
};

/** Hero header for albums, artists, playlists and facets, tinted with the collection palette. */
export function CollectionHeader({ palette, art, eyebrow, title, description, meta, round }: Props) {
  return (
    <header className="relative isolate -mt-16 overflow-hidden px-4 pb-6 pt-24 sm:px-8 sm:pb-8 sm:pt-28">
      <div className="absolute inset-0 -z-10" style={{ background: `linear-gradient(180deg, ${palette[1]}cc 0%, ${palette[2]}99 55%, transparent 100%)` }} aria-hidden="true" />
      <div className="absolute -right-20 -top-24 -z-10 h-80 w-80 rounded-full opacity-40 blur-[90px]" style={{ background: palette[0] }} aria-hidden="true" />
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-end">
        <motion.div
          initial={{ opacity: 0, scale: 0.85, rotate: -4 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 160, damping: 18 }}
          className={cn('w-48 shrink-0 shadow-[0_30px_60px_-20px_rgba(0,0,0,.85)] sm:w-56 lg:w-60', round ? 'rounded-full' : 'rounded-2xl')}
        >
          {art}
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.08, ease: [0.22, 1, 0.36, 1] }} className="min-w-0 text-center sm:text-left">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-white/80">{eyebrow}</p>
          <h1 className="mt-2 break-words font-display text-4xl font-extrabold leading-[1.02] tracking-tight text-white sm:text-5xl lg:text-6xl">{title}</h1>
          {description && <div className="mx-auto mt-3 max-w-2xl text-sm text-white/75 sm:mx-0">{description}</div>}
          {meta && <div className="mt-3 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm text-white/80 sm:justify-start">{meta}</div>}
        </motion.div>
      </div>
    </header>
  );
}
