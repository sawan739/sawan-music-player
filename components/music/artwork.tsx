'use client';
import { memo, useId, useState } from 'react';
import type { Artwork as ArtworkSpec, Track } from '@/types/music';
import { useLibraryStore } from '@/store/library-store';
import { cn } from '@/utils/format';

/** Deterministic pseudo-random sequence for stable procedural art. */
function seq(seed: number) {
  let s = seed || 1;
  return () => ((s = Math.imul(s ^ (s >>> 15), 2246822507) ^ Math.imul(s ^ (s >>> 13), 3266489909)) >>> 0) / 4294967296;
}

function Pattern({ art, id }: { art: ArtworkSpec; id: string }) {
  const [a, b] = art.palette;
  const r = seq(art.seed);
  switch (art.pattern) {
    case 'waves':
      return <g fill="none" strokeLinecap="round">{[0, 1, 2, 3, 4, 5].map(i => {
        const y = 30 + i * 11 + r() * 4, amp = 6 + r() * 8;
        return <path key={i} d={`M-10 ${y} C 20 ${y - amp}, 45 ${y + amp}, 70 ${y} S 110 ${y - amp}, 120 ${y}`} stroke={i % 2 ? a : '#fff'} strokeOpacity={0.18 + i * 0.07} strokeWidth={2.4 - i * 0.2} />;
      })}</g>;
    case 'rings':
      return <g fill="none">{[0, 1, 2, 3, 4, 5, 6].map(i => <circle key={i} cx={72 - r() * 8} cy={30 + r() * 8} r={8 + i * 11} stroke={i % 2 ? '#fff' : a} strokeOpacity={0.32 - i * 0.035} strokeWidth={1.6} />)}</g>;
    case 'rain':
      return <g>
        {Array.from({ length: 26 }, (_, i) => { const x = r() * 110 - 5, y = r() * 100, l = 7 + r() * 12; return <line key={i} x1={x} y1={y} x2={x - l * 0.25} y2={y + l} stroke="#fff" strokeOpacity={0.12 + r() * 0.3} strokeWidth={0.7} strokeLinecap="round" />; })}
        <circle cx={70} cy={30} r={20} fill={`url(#${id}-glow)`} />
        <ellipse cx={30} cy={86} rx={18} ry={3} fill="none" stroke={a} strokeOpacity={0.5} strokeWidth={0.8} />
        <ellipse cx={30} cy={86} rx={9} ry={1.5} fill="none" stroke="#fff" strokeOpacity={0.4} strokeWidth={0.6} />
      </g>;
    case 'sun':
      return <g>
        <defs><linearGradient id={`${id}-sun`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fde68a" /><stop offset="1" stopColor={b} /></linearGradient>
          <clipPath id={`${id}-cut`}>{[0, 1, 2, 3, 4, 5].map(i => <rect key={i} x="0" y={i < 2 ? 0 : 52 + (i - 2) * 6.5} width="100" height={i < 2 ? 52 : 4.5 - (i - 2) * 0.8} />)}</clipPath></defs>
        <circle cx="50" cy="56" r="27" fill={`url(#${id}-sun)`} clipPath={`url(#${id}-cut)`} />
        {[0, 1, 2, 3, 4, 5, 6].map(i => <line key={i} x1="0" y1={78 + i * i * 0.9} x2="100" y2={78 + i * i * 0.9} stroke={a} strokeOpacity={0.55} strokeWidth={0.5} />)}
        {[-60, -30, -10, 10, 30, 60].map(x => <line key={x} x1={50 + x * 0.2} y1="78" x2={50 + x * 1.8} y2="100" stroke={a} strokeOpacity={0.45} strokeWidth={0.5} />)}
      </g>;
    case 'grid':
      return <g stroke="#fff" strokeOpacity={0.12} strokeWidth={0.5}>
        {Array.from({ length: 11 }, (_, i) => <line key={`v${i}`} x1={i * 10} y1="0" x2={i * 10} y2="100" />)}
        {Array.from({ length: 11 }, (_, i) => <line key={`h${i}`} x1="0" y1={i * 10} x2="100" y2={i * 10} />)}
        {Array.from({ length: 7 }, (_, i) => <rect key={i} x={Math.floor(r() * 10) * 10} y={Math.floor(r() * 10) * 10} width="10" height="10" fill={i % 2 ? a : '#fff'} fillOpacity={0.22 + r() * 0.3} stroke="none" />)}
      </g>;
    case 'mandala':
      return <g transform="translate(50 50)" fill="none">
        {Array.from({ length: 12 }, (_, i) => <ellipse key={i} rx="9" ry="30" transform={`rotate(${i * 15})`} stroke={i % 2 ? '#fff' : a} strokeOpacity={0.28} strokeWidth={0.7} />)}
        {[12, 20, 38].map(rr => <circle key={rr} r={rr} stroke="#fff" strokeOpacity={0.22} strokeWidth={0.6} />)}
        <circle r="5" fill={a} fillOpacity={0.8} />
      </g>;
    case 'bars':
      return <g>{Array.from({ length: 14 }, (_, i) => { const h = 15 + r() * 55; return <rect key={i} x={6 + i * 6.6} y={86 - h} width="3.6" height={h} rx="1.8" fill={i % 3 ? '#fff' : a} fillOpacity={0.18 + r() * 0.35} />; })}</g>;
    case 'blob':
    default:
      return <g>
        <circle cx={25 + r() * 30} cy={25 + r() * 30} r={30} fill={a} fillOpacity={0.55} filter={`url(#${id}-blur)`} />
        <circle cx={55 + r() * 25} cy={55 + r() * 25} r={26} fill={b} fillOpacity={0.6} filter={`url(#${id}-blur)`} />
        <circle cx={70} cy={22} r={12} fill="#fff" fillOpacity={0.14} filter={`url(#${id}-blur)`} />
      </g>;
  }
}

type Props = { art: ArtworkSpec; className?: string; rounded?: string; label?: string; alt?: string };

/** Procedural cover art; uses `art.url` when a real image is available, falling back on error. */
export const Artwork = memo(function Artwork({ art, className, rounded = 'rounded-xl', label, alt = '' }: Props) {
  const raw = useId();
  const id = `art${raw.replace(/[^a-zA-Z0-9]/g, '')}`;
  const [failed, setFailed] = useState(false);
  const [a, b, c] = art.palette;
  return (
    <div className={cn('relative isolate overflow-hidden bg-ink-800 [container-type:inline-size]', rounded, className)}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <defs>
          <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={a} /><stop offset="0.55" stopColor={b} /><stop offset="1" stopColor={c} />
          </linearGradient>
          <radialGradient id={`${id}-glow`}><stop offset="0" stopColor="#fff" stopOpacity="0.55" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></radialGradient>
          <filter id={`${id}-blur`} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="9" /></filter>
        </defs>
        <rect width="100" height="100" fill={`url(#${id}-bg)`} />
        <Pattern art={art} id={id} />
      </svg>
      {label && (
        <div className="absolute inset-x-0 bottom-0 p-[8%]">
          <p className="font-display text-[clamp(.7rem,9cqw,1.6rem)] font-extrabold leading-[1.05] tracking-tight text-white drop-shadow-[0_2px_10px_rgba(0,0,0,.35)]">{label}</p>
        </div>
      )}
      {art.url && !failed && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={art.url} alt={alt} loading="lazy" decoding="async" onError={() => setFailed(true)} className="absolute inset-0 h-full w-full object-cover" />
      )}
    </div>
  );
});

/** Track artwork that upgrades to the YouTube thumbnail once the video has been resolved. */
export function TrackArtwork({ track, ...rest }: Omit<Props, 'art'> & { track: Track }) {
  const videoId = useLibraryStore(s => (track.source.kind === 'youtube' ? s.videoIds[track.source.songId] : undefined));
  const art = videoId ? { ...track.artwork, url: `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg` } : track.artwork;
  return <Artwork art={art} alt="" {...rest} />;
}
