'use client';
import { useEffect } from 'react';
import { currentTrackOf, usePlayerStore } from '@/store/player-store';
import { useLibraryStore } from '@/store/library-store';
import { useUIStore } from '@/store/ui-store';

export const SHORTCUTS: [string, string][] = [
  ['Space', 'Play / pause'],
  ['Shift + →  /  Shift + ←', 'Next / previous track'],
  ['→  /  ←', 'Seek forward / back 5 seconds'],
  ['↑  /  ↓', 'Volume up / down'],
  ['M', 'Mute / unmute'],
  ['L', 'Like current song'],
  ['S', 'Toggle shuffle'],
  ['R', 'Cycle repeat'],
  ['F', 'Open / close Now Playing'],
  ['Q', 'Open / close queue'],
  ['/  or  Ctrl + K', 'Search'],
  ['?', 'Show shortcuts'],
];

function isTyping(el: EventTarget | null) {
  if (!(el instanceof HTMLElement)) return false;
  return el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName);
}

export function useKeyboardShortcuts(focusSearch: () => void) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); focusSearch(); return; }
      if (e.ctrlKey || e.metaKey || e.altKey || isTyping(e.target)) return;

      const p = usePlayerStore.getState();
      const ui = useUIStore.getState();
      const target = e.target as HTMLElement | null;
      const onControl = !!target?.closest('button, a, [role="slider"], [role="menuitem"]');

      switch (e.key) {
        case ' ':
          if (onControl) return; // let the focused button handle Space itself
          e.preventDefault(); p.togglePlay(); break;
        case 'ArrowRight':
          if (e.shiftKey) p.next(); else if (!onControl) p.seek(Math.min(p.duration, p.position + 5)); else return;
          e.preventDefault(); break;
        case 'ArrowLeft':
          if (e.shiftKey) p.previous(); else if (!onControl) p.seek(Math.max(0, p.position - 5)); else return;
          e.preventDefault(); break;
        case 'ArrowUp':
          if (onControl) return; e.preventDefault(); p.setVolume(p.volume + 0.05); break;
        case 'ArrowDown':
          if (onControl) return; e.preventDefault(); p.setVolume(p.volume - 0.05); break;
        case 'm': case 'M': p.toggleMute(); break;
        case 's': case 'S': p.toggleShuffle(); break;
        case 'r': case 'R': p.cycleRepeat(); break;
        case 'l': case 'L': {
          const t = currentTrackOf(p);
          if (t) {
            const liked = useLibraryStore.getState().toggleLike(t);
            ui.toast(liked ? `Added “${t.title}” to Liked Songs` : 'Removed from Liked Songs', liked ? 'like' : 'default');
          }
          break;
        }
        case 'f': case 'F': if (currentTrackOf(p)) ui.setNowPlaying(!ui.nowPlayingOpen); break;
        case 'q': case 'Q': ui.setQueueOpen(!ui.queueOpen); break;
        case '/': e.preventDefault(); focusSearch(); break;
        case '?': ui.setShortcutsOpen(!ui.shortcutsOpen); break;
        case 'Escape':
          if (ui.trackMenu) ui.closeTrackMenu();
          else if (ui.queueOpen) ui.setQueueOpen(false);
          else if (ui.nowPlayingOpen) ui.setNowPlaying(false);
          break;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [focusSearch]);
}
