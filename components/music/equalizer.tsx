import { cn } from '@/utils/format';

/** Decorative equalizer bars. Animation pauses (and freezes) when `playing` is false. */
export function Equalizer({ playing, className, bars = 4 }: { playing: boolean; className?: string; bars?: number }) {
  return (
    <span data-playing={playing} className={cn('inline-flex h-4 items-end gap-[2px]', className)} aria-hidden="true">
      {Array.from({ length: bars }, (_, i) => (
        <span
          key={i}
          className="anim-when-playing h-full w-[3px] origin-bottom animate-eq rounded-full bg-accent"
          style={{ animationDelay: `${i * -0.23}s`, animationDuration: `${0.75 + (i % 3) * 0.18}s` }}
        />
      ))}
    </span>
  );
}
