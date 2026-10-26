'use client';
import { useEffect } from 'react';
import { useCurrentTrack } from '@/hooks/use-player';
import { usePlayerStore } from '@/store/player-store';
import { hexToRgbTriplet } from '@/utils/color';
import type { Palette } from '@/types/music';

const BRAND: Palette = ['#3ee8d0', '#8b5cf6', '#1e1b4b'];

/**
 * Slow-drifting aurora blobs tinted by the playing track's artwork. Colours cross-fade
 * via CSS transitions; drifting pauses when playback pauses or reduced motion is on.
 */
export function AmbientBackground() {
  const track = useCurrentTrack();
  const playing = usePlayerStore(s => s.status === 'playing');
  const palette = track?.artwork.palette ?? BRAND;

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--accent', hexToRgbTriplet(palette[0]));
    root.style.setProperty('--accent-2', hexToRgbTriplet(palette[1]));
  }, [palette]);

  const blob = 'anim-when-playing absolute rounded-full blur-[110px] transition-[background-color] duration-[1600ms] animate-drift';
  return (
    <div data-playing={playing} className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-ink-950" aria-hidden="true">
      <div className={`${blob} -left-[15%] -top-[20%] h-[55vmax] w-[55vmax] opacity-[0.22]`} style={{ backgroundColor: palette[0] }} />
      <div className={`${blob} -right-[20%] top-[10%] h-[50vmax] w-[50vmax] opacity-[0.2]`} style={{ backgroundColor: palette[1], animationDelay: '-7s', animationDuration: '28s' }} />
      <div className={`${blob} -bottom-[30%] left-[20%] h-[45vmax] w-[45vmax] opacity-[0.16]`} style={{ backgroundColor: palette[2] === '#1e1b4b' ? '#ec4899' : palette[1], animationDelay: '-14s', animationDuration: '34s' }} />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,transparent_0%,rgba(5,6,11,.55)_60%,#05060b_100%)]" />
    </div>
  );
}
