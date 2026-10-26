import type { Palette } from '@/types/music';
import { cn } from '@/utils/format';

/** A spinning vinyl record whose label uses the album palette. Spin pauses with playback. */
export function Vinyl({ palette, playing, className }: { palette: Palette; playing: boolean; className?: string }) {
  return (
    <div data-playing={playing} className={cn('aspect-square', className)} aria-hidden="true">
      <div
        className="anim-when-playing h-full w-full animate-spin-slow rounded-full shadow-[0_20px_60px_-15px_rgba(0,0,0,.9)]"
        style={{
          background: `radial-gradient(circle, ${palette[0]} 0 14%, ${palette[1]} 14.5% 30%, #0b0b10 30.5% 31.5%, transparent 32%),
            repeating-radial-gradient(circle, #121218 0 1.2%, #1b1b24 1.4% 2.2%),
            conic-gradient(from 30deg, rgba(255,255,255,.14), transparent 15%, rgba(255,255,255,.08) 50%, transparent 65%, rgba(255,255,255,.14))`,
          backgroundBlendMode: 'normal, normal, screen',
        }}
      >
        <div className="relative left-1/2 top-1/2 h-[3%] w-[3%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink-950" />
      </div>
    </div>
  );
}
