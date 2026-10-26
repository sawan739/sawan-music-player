'use client';
import { useCallback, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { MotionConfig } from 'motion/react';
import { AmbientBackground } from './ambient-background';
import { Sidebar } from './sidebar';
import { TopBar } from './top-bar';
import { MobileNav } from './mobile-nav';
import { Toaster } from './toaster';
import { TrackMenu } from './track-menu';
import { CreatePlaylistDialog, PlaylistPicker, ShortcutsDialog } from './playlist-dialogs';
import { PlayerBar } from '@/components/player/player-bar';
import { NowPlaying } from '@/components/player/now-playing';
import { QueueDrawer } from '@/components/player/queue-drawer';
import { YouTubeDock } from '@/components/player/youtube-dock';
import { PlaybackHost } from '@/components/player/playback-host';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';

/**
 * Persistent application frame. Lives in the root layout, so the player, queue and
 * engines survive every client-side navigation.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const main = useRef<HTMLElement>(null);
  const search = useRef<HTMLInputElement>(null);

  useEffect(() => { main.current?.scrollTo({ top: 0 }); }, [pathname]);

  const focusSearch = useCallback(() => {
    const input = search.current;
    if (input && input.offsetParent !== null) input.focus();
    else router.push('/search');
  }, [router]);
  useKeyboardShortcuts(focusSearch);

  return (
    <MotionConfig reducedMotion="user">
      <a href="#main" className="sr-only z-[100] rounded-full bg-mist px-4 py-2 font-semibold text-ink-950 focus:not-sr-only focus:fixed focus:left-4 focus:top-4">Skip to content</a>
      <AmbientBackground />
      <div className="flex h-dvh flex-col">
        <div className="flex min-h-0 flex-1">
          <Sidebar />
          <main id="main" ref={main} tabIndex={-1} className="relative min-w-0 flex-1 overflow-y-auto overflow-x-hidden outline-none">
            <TopBar ref={search} scrollRef={main} />
            <div className="pb-12">{children}</div>
          </main>
        </div>
        <PlayerBar />
        <MobileNav />
      </div>
      <NowPlaying />
      <QueueDrawer />
      <YouTubeDock />
      <TrackMenu />
      <PlaylistPicker />
      <CreatePlaylistDialog />
      <ShortcutsDialog />
      <Toaster />
      <PlaybackHost />
    </MotionConfig>
  );
}
