'use client';
import { useId } from 'react';
import { cn } from '@/utils/format';

/** Sawan Music mark: a monsoon raindrop holding a live sound wave. */
export function LogoMark({ className, animated = false }: { className?: string; animated?: boolean }) {
  const bars = [
    { x: 13.2, h: 6 }, { x: 16.6, h: 11 }, { x: 20, h: 15 }, { x: 23.4, h: 9 }, { x: 26.8, h: 5 },
  ];
  // Unique per instance: a gradient inside a hidden (display:none) SVG can't be referenced.
  const gradient = `sawan-logo-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  return (
    <svg viewBox="0 0 40 40" className={cn('h-9 w-9', className)} aria-hidden="true">
      <defs>
        <linearGradient id={gradient} x1="6" y1="2" x2="34" y2="38" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3ee8d0" /><stop offset=".55" stopColor="#8b5cf6" /><stop offset="1" stopColor="#ec4899" />
        </linearGradient>
      </defs>
      <path d="M20 2.5c6.6 8.2 13 15.2 13 22.3a13 13 0 0 1-26 0C7 17.7 13.4 10.7 20 2.5Z" fill={`url(#${gradient})`} />
      <path d="M12.5 21.5a8.6 8.6 0 0 1 4-6.6" stroke="#fff" strokeOpacity=".55" strokeWidth="1.6" strokeLinecap="round" fill="none" />
      {bars.map((b, i) => (
        <rect
          key={b.x} x={b.x - 1.05} y={27 - b.h / 2} width="2.1" height={b.h} rx="1.05" fill="#fff"
          className={animated ? 'anim-when-playing origin-center animate-eq [transform-box:fill-box]' : undefined}
          style={animated ? { animationDelay: `${i * -0.18}s`, animationDuration: `${0.8 + (i % 3) * 0.2}s` } : undefined}
        />
      ))}
    </svg>
  );
}

export function Logo({ className, animated }: { className?: string; animated?: boolean }) {
  return (
    <span className={cn('flex items-center gap-2.5', className)}>
      <LogoMark animated={animated} />
      <span className="flex flex-col leading-none">
        <span className="font-display text-[1.35rem] font-extrabold tracking-tight text-mist">sawan</span>
        <span className="mt-0.5 text-[0.62rem] font-semibold uppercase tracking-[0.42em] text-rain-300">music</span>
      </span>
    </span>
  );
}
