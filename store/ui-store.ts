'use client';
import { create } from 'zustand';
import type { ReactNode } from 'react';
import type { Track } from '@/types/music';

export type ToastTone = 'default' | 'like' | 'success' | 'error' | 'queue';
export type Toast = { id: number; message: string; tone: ToastTone };

export type MenuExtra = { label: string; icon?: ReactNode; danger?: boolean; onSelect: () => void };
export type TrackMenu = { track: Track; x: number; y: number; extra?: MenuExtra[] };

type UIState = {
  hydrated: boolean;
  nowPlayingOpen: boolean;
  queueOpen: boolean;
  shortcutsOpen: boolean;
  searchQuery: string;
  toasts: Toast[];
  trackMenu: TrackMenu | null;
  /** Tracks waiting to be added via the "Add to playlist" dialog. */
  playlistPicker: Track[] | null;
  createPlaylistOpen: boolean;
  /** Element in the Now Playing view that the YouTube player should dock into. */
  videoSlot: HTMLElement | null;
};

type UIActions = {
  setHydrated(): void;
  setNowPlaying(open: boolean): void;
  setQueueOpen(open: boolean): void;
  setShortcutsOpen(open: boolean): void;
  setSearchQuery(q: string): void;
  toast(message: string, tone?: ToastTone): void;
  dismissToast(id: number): void;
  openTrackMenu(menu: TrackMenu): void;
  closeTrackMenu(): void;
  openPlaylistPicker(tracks: Track[]): void;
  closePlaylistPicker(): void;
  setCreatePlaylistOpen(open: boolean): void;
  setVideoSlot(el: HTMLElement | null): void;
};

let toastId = 0;

export const useUIStore = create<UIState & UIActions>()((set, get) => ({
  hydrated: false, nowPlayingOpen: false, queueOpen: false, shortcutsOpen: false, searchQuery: '',
  toasts: [], trackMenu: null, playlistPicker: null, createPlaylistOpen: false, videoSlot: null,

  setHydrated: () => set({ hydrated: true }),
  setNowPlaying: open => set({ nowPlayingOpen: open }),
  setQueueOpen: open => set({ queueOpen: open }),
  setShortcutsOpen: open => set({ shortcutsOpen: open }),
  setSearchQuery: q => set({ searchQuery: q }),
  toast(message, tone = 'default') {
    const id = ++toastId;
    set(s => ({ toasts: [...s.toasts.slice(-2), { id, message, tone }] }));
    setTimeout(() => get().dismissToast(id), 2800);
  },
  dismissToast: id => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })),
  openTrackMenu: menu => set({ trackMenu: menu }),
  closeTrackMenu: () => set({ trackMenu: null }),
  openPlaylistPicker: tracks => set({ playlistPicker: tracks, trackMenu: null }),
  closePlaylistPicker: () => set({ playlistPicker: null }),
  setCreatePlaylistOpen: open => set({ createPlaylistOpen: open }),
  setVideoSlot: el => set({ videoSlot: el }),
}));
