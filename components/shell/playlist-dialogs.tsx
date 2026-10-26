'use client';
import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { Check, Plus } from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';
import { Artwork } from '@/components/music/artwork';
import { useLibraryStore } from '@/store/library-store';
import { useUIStore } from '@/store/ui-store';
import { useTrackActions } from '@/hooks/use-library';
import { SHORTCUTS } from '@/hooks/use-keyboard-shortcuts';
import { plural } from '@/utils/format';

function NewPlaylistForm({ onCreate, submitLabel = 'Create' }: { onCreate: (name: string) => void; submitLabel?: string }) {
  const [name, setName] = useState('');
  return (
    <form onSubmit={e => { e.preventDefault(); onCreate(name); setName(''); }} className="flex gap-2">
      <input
        data-autofocus
        value={name}
        onChange={e => setName(e.target.value)}
        maxLength={60}
        placeholder="Playlist name"
        aria-label="New playlist name"
        className="min-w-0 flex-1 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none transition placeholder:text-faint focus:border-accent/60 focus:bg-white/[0.08]"
      />
      <button type="submit" className="btn-primary px-5 py-2.5">{submitLabel}</button>
    </form>
  );
}

export function PlaylistPicker() {
  const tracks = useUIStore(s => s.playlistPicker);
  const closePicker = useUIStore(s => s.closePlaylistPicker);
  const playlists = useLibraryStore(s => s.playlists);
  const { addToPlaylist } = useTrackActions();
  const toast = useUIStore(s => s.toast);
  const onClose = useCallback(() => closePicker(), [closePicker]);
  const [justAdded, setJustAdded] = useState<string | null>(null);

  const single = tracks?.length === 1 ? tracks[0] : null;
  return (
    <Dialog open={!!tracks} onClose={onClose} title="Add to playlist" description={single ? `“${single.title}”` : tracks ? plural(tracks.length, 'song') : undefined}>
      <NewPlaylistForm
        submitLabel="New"
        onCreate={name => {
          const p = useLibraryStore.getState().createPlaylist(name || 'My Playlist', tracks ?? []);
          toast(`Created “${p.name}”`, 'success');
          onClose();
        }}
      />
      <ul className="mt-4 max-h-72 space-y-1 overflow-y-auto">
        {playlists.length === 0 && <li className="py-6 text-center text-sm text-muted">No playlists yet — name one above.</li>}
        {playlists.map(p => {
          const contains = !!single && p.tracks.some(t => t.id === single.id);
          return (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => { if (!tracks) return; addToPlaylist(p.id, tracks); setJustAdded(p.id); setTimeout(onClose, 450); }}
                className="flex w-full items-center gap-3 rounded-xl p-2 text-left transition hover:bg-white/[0.06]"
              >
                <Artwork art={{ palette: p.palette, pattern: 'waves', seed: p.createdAt % 997 }} className="h-11 w-11 shrink-0" rounded="rounded-lg" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">{p.name}</span>
                  <span className="block text-xs text-muted">{plural(p.tracks.length, 'song')}</span>
                </span>
                {(contains || justAdded === p.id) && (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 15 }} className="grid h-6 w-6 place-items-center rounded-full bg-rain-400 text-ink-950">
                    <Check size={14} strokeWidth={3} />
                  </motion.span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </Dialog>
  );
}

export function CreatePlaylistDialog() {
  const open = useUIStore(s => s.createPlaylistOpen);
  const setOpen = useUIStore(s => s.setCreatePlaylistOpen);
  const router = useRouter();
  const onClose = useCallback(() => setOpen(false), [setOpen]);
  return (
    <Dialog open={open} onClose={onClose} title="Create playlist" description="Give it a name — you can add songs right after.">
      <NewPlaylistForm onCreate={name => {
        const p = useLibraryStore.getState().createPlaylist(name || 'My Playlist');
        onClose();
        router.push(`/library/playlist/${p.id}`);
      }} />
      <p className="mt-3 flex items-center gap-1.5 text-xs text-faint"><Plus size={13} /> Tip: right-click any song to add it to a playlist.</p>
    </Dialog>
  );
}

export function ShortcutsDialog() {
  const open = useUIStore(s => s.shortcutsOpen);
  const setOpen = useUIStore(s => s.setShortcutsOpen);
  const onClose = useCallback(() => setOpen(false), [setOpen]);
  return (
    <Dialog open={open} onClose={onClose} title="Keyboard shortcuts">
      <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2.5 text-sm">
        {SHORTCUTS.map(([keys, action]) => (
          <div key={keys} className="contents">
            <dt><kbd className="whitespace-nowrap rounded-md border border-white/15 bg-white/5 px-2 py-0.5 font-sans text-xs text-mist">{keys}</kbd></dt>
            <dd className="text-muted">{action}</dd>
          </div>
        ))}
      </dl>
    </Dialog>
  );
}
