'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/utils/format';

type Props = { title: string; subtitle?: string; href?: string; children: React.ReactNode; className?: string };

/** Horizontally scrolling row of cards with snap points and arrow controls. */
export function Shelf({ title, subtitle, href, children, className }: Props) {
  const scroller = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const update = () => setEdges({ start: el.scrollLeft < 8, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 8 });
    update();
    el.addEventListener('scroll', update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => { el.removeEventListener('scroll', update); ro.disconnect(); };
  }, []);

  const scroll = (dir: 1 | -1) => scroller.current?.scrollBy({ left: dir * scroller.current.clientWidth * 0.85, behavior: 'smooth' });

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className={cn('relative', className)}
      aria-label={title}
    >
      <div className="mb-3 flex items-end justify-between gap-4 px-4 sm:px-8">
        <div className="min-w-0">
          <h2 className="truncate font-display text-xl font-bold tracking-tight text-mist sm:text-2xl">{title}</h2>
          {subtitle && <p className="mt-0.5 truncate text-sm text-muted">{subtitle}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {href && <Link href={href} className="mr-1 text-sm font-semibold text-muted transition hover:text-mist">See all</Link>}
          <button type="button" aria-label={`Scroll ${title} left`} onClick={() => scroll(-1)} disabled={edges.start} className="icon-btn hidden h-8 w-8 bg-white/5 disabled:opacity-30 sm:inline-grid"><ChevronLeft size={18} /></button>
          <button type="button" aria-label={`Scroll ${title} right`} onClick={() => scroll(1)} disabled={edges.end} className="icon-btn hidden h-8 w-8 bg-white/5 disabled:opacity-30 sm:inline-grid"><ChevronRight size={18} /></button>
        </div>
      </div>
      <div ref={scroller} className="no-scrollbar flex snap-x snap-mandatory scroll-px-4 gap-1 overflow-x-auto px-2 pb-2 sm:scroll-px-8 sm:px-6">
        {children}
      </div>
    </motion.section>
  );
}
