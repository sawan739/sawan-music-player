'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import { AnimatePresence, motion, Reorder, useDragControls } from 'motion/react';
import { Check, GripVertical, ListOrdered, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import type { Track, UserPlaylist } from '@/types/music';
import { useLibraryStore } from '@/store/library-store';
import { useUIStore } from '@/store/ui-store';
import { useSearch } from '@/hooks/use-search';
import { CollectionHeader } from '@/components/music/collection-header';
import { CollectionActions } from '@/components/music/collection-actions';
import { TrackList } from '@/components/music/track-list';
import { Artwork, TrackArtwork } from '@/components/music/artwork';
import { Dialog } from '@/components/ui/dialog';
import { CollectionSkeleton, TrackListSkeleton } from '@/components/ui/skeleton';
import { artistNames, cn, formatTotalDuration, plural } from '@/utils/format';

function Mosaic({ playlist }: { playlist: UserPlaylist }) {
  const firstFour = playlist.tracks.slice(0, 4);
  if (firstFour.length < 4) return <Artwork art={{ palette: playlist.palette, pattern: 'waves', seed: playlist.createdAt % 997 }} label={playlist.name} className="aspect-square w-full" rounded="rounded-2xl" />;
  return (
    <div className="grid aspect-square grid-cols-2 overflow-hidden rounded-2xl">
      {firstFour.map(t => <TrackArtwork key={t.id} track={t} rounded="rounded-none" className="aspect-square w-full" />)}
    </div>
  );
}

function EditableRow({ track, onRemove }: { track: Track; onRemove: () => void }) {
  const controls = useDragControls();
  return (
    <Reorder.Item value={track} dragListener={false} dragControls={controls} whileDrag={{ scale: 1.02, boxShadow: '0 20px 40px -12px rgba(0,0,0,.8)' }}
      exit={{ opacity: 0, height: 0 }} className="flex items-center gap-3 rounded-xl bg-ink-900/60 p-2">
      <button type="button" aria-label={`Drag to reorder ${track.title}`} onPointerDown={e => controls.start(e)} className="cursor-grab touch-none p-1 text-faint hover:text-mist active:cursor-grabbing"><GripVertical size={18} /></button>
      <TrackArtwork track={track} className="h-10 w-10 shrink-0" rounded="rounded-md" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{track.title}</p>
        <p className="truncate text-xs text-muted">{artistNames(track.artists)}</p>
      </div>
      <button type="button" aria-label={`Remove ${track.title}`} onClick={onRemove} className="icon-btn h-9 w-9 hover:text-blush-400"><X size={17} /></button>
    </Reorder.Item>
  );
}

function SongFinder({ playlist }: { playlist: UserPlaylist }) {
  const [query, setQuery] = useState('');
  const { results, loading } = useSearch(query);
  const have = useMemo(() => new Set(playlist.tracks.map(t => t.id)), [playlist.tracks]);
  const add = (t: Track) => { useLibraryStore.getState().addToPlaylist(playlist.id, [t]); useUIStore.getState().toast(`Added “${t.title}”`, 'success'); };
  return (
    <motion.section initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden px-4 sm:px-8" aria-label="Find songs to add">
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <p className="font-display text-lg font-bold">Let&apos;s find something for your playlist</p>
        <label className="relative mt-3 flex max-w-md items-center">
          <Search size={17} className="pointer-events-none absolute left-3.5 text-faint" />
          <input autoFocus value={query} onChange={e => setQuery(e.target.value)} placeholder="Search for songs" aria-label="Search for songs to add"
            className="h-11 w-full rounded-full border border-white/10 bg-white/[0.06] pl-10 pr-4 text-sm outline-none focus:border-accent/50" />
        </label>
        <div className="mt-3">
          {loading && <TrackListSkeleton rows={3} />}
          {!loading && results && results.tracks.length === 0 && <p className="py-4 text-sm text-muted">No songs match “{query}”.</p>}
          {!loading && results && (
            <ul className="space-y-0.5">
              {results.tracks.slice(0, 8).map(t => (
                <li key={t.id} className="flex items-center gap-3 rounded-xl p-2 hover:bg-white/[0.05]">
                  <TrackArtwork track={t} className="h-10 w-10 shrink-0" rounded="rounded-md" />
                  <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{t.title}</p><p className="truncate text-xs text-muted">{artistNames(t.artists)}</p></div>
                  <button type="button" disabled={have.has(t.id)} onClick={() => add(t)} className={cn('btn-ghost px-4 py-1.5 text-xs', have.has(t.id) && 'border-rain-400/40 text-rain-300')}>
                    {have.has(t.id) ? <><Check size={14} /> Added</> : 'Add'}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </motion.section>
  );
}

export function UserPlaylistView({ id }: { id: string }) {
  const router = useRouter();
  const hydrated = useUIStore(s => s.hydrated);
  const playlist = useLibraryStore(s => s.playlists.find(p => p.id === id));
  const [editing, setEditing] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [finder, setFinder] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const closeDelete = useCallback(() => setConfirmDelete(false), []);

  const extraMenu = useCallback((t: Track) => [{
    label: 'Remove from this playlist', danger: true, icon: <Trash2 size={17} />,
    onSelect: () => useLibraryStore.getState().removeFromPlaylist(id, t.id),
  }], [id]);

  if (!hydrated) return <CollectionSkeleton />;
  if (!playlist) {
    return (
      <div className="px-6 py-24 text-center">
        <p className="font-display text-2xl font-bold">Playlist not found</p>
        <p className="mt-1 text-muted">It may have been deleted.</p>
        <Link href="/library" className="btn-primary mt-6">Back to Library</Link>
      </div>
    );
  }

  const context = { label: playlist.name, href: `/library/playlist/${playlist.id}` };
  const total = playlist.tracks.reduce((s, t) => s + (t.duration ?? 0), 0);

  return (
    <>
      <CollectionHeader
        palette={playlist.palette}
        art={<Mosaic playlist={playlist} />}
        eyebrow="Your playlist"
        title={playlist.name}
        description={renaming ? (
          <form className="flex max-w-md gap-2" onSubmit={e => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            useLibraryStore.getState().renamePlaylist(playlist.id, String(f.get('name')), String(f.get('description')));
            setRenaming(false);
          }}>
            <div className="flex-1 space-y-2">
              <input name="name" defaultValue={playlist.name} autoFocus aria-label="Playlist name" maxLength={60} className="w-full rounded-lg bg-black/30 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-accent" />
              <input name="description" defaultValue={playlist.description} aria-label="Description" placeholder="Add a description" maxLength={140} className="w-full rounded-lg bg-black/30 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-accent" />
            </div>
            <button type="submit" className="btn-primary self-start px-4 py-2">Save</button>
          </form>
        ) : playlist.description || undefined}
        meta={<><span className="font-bold text-white">Sawan</span><span aria-hidden="true">•</span><span>{plural(playlist.tracks.length, 'song')}</span>{total > 0 && <><span aria-hidden="true">•</span><span>{formatTotalDuration(total)}+</span></>}</>}
      />
      <CollectionActions tracks={playlist.tracks} context={context}>
        <button type="button" onClick={() => setFinder(!finder)} aria-pressed={finder} className={cn('btn-ghost', finder && 'border-accent/50 text-accent')}><Plus size={17} /> Add songs</button>
        <button type="button" onClick={() => setRenaming(!renaming)} aria-label="Edit details" className="icon-btn h-12 w-12 border border-white/10"><Pencil size={18} /></button>
        {playlist.tracks.length > 1 && (
          <button type="button" onClick={() => setEditing(!editing)} aria-pressed={editing} aria-label="Reorder songs" className={cn('icon-btn h-12 w-12 border border-white/10', editing && 'border-accent/50 text-accent hover:text-accent')}><ListOrdered size={18} /></button>
        )}
        <button type="button" onClick={() => setConfirmDelete(true)} aria-label="Delete playlist" className="icon-btn h-12 w-12 border border-white/10 hover:text-blush-400"><Trash2 size={18} /></button>
      </CollectionActions>

      <AnimatePresence>{(finder || playlist.tracks.length === 0) && <SongFinder key="finder" playlist={playlist} />}</AnimatePresence>

      <section className="mt-6 px-2 sm:px-6" aria-label="Songs">
        {editing ? (
          <>
            <p className="mb-3 px-2 text-sm text-muted">Drag the handles to reorder. Changes save automatically.</p>
            <Reorder.Group axis="y" values={playlist.tracks} onReorder={tracks => useLibraryStore.getState().reorderPlaylist(playlist.id, tracks)} className="flex flex-col gap-1.5">
              <AnimatePresence initial={false}>
                {playlist.tracks.map(t => <EditableRow key={t.id} track={t} onRemove={() => useLibraryStore.getState().removeFromPlaylist(playlist.id, t.id)} />)}
              </AnimatePresence>
            </Reorder.Group>
          </>
        ) : playlist.tracks.length > 0 && (
          <TrackList tracks={playlist.tracks} context={context} showAlbum showHeader extraMenu={extraMenu} />
        )}
      </section>

      <Dialog open={confirmDelete} onClose={closeDelete} title="Delete playlist?" description={`“${playlist.name}” will be removed from your library. This can't be undone.`}>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={closeDelete} className="btn-ghost" data-autofocus>Cancel</button>
          <button type="button" className="btn bg-blush-500 px-5 py-2.5 text-sm text-white hover:bg-blush-400" onClick={() => {
            useLibraryStore.getState().deletePlaylist(playlist.id);
            useUIStore.getState().toast(`Deleted “${playlist.name}”`);
            router.push('/library');
          }}>Delete</button>
        </div>
      </Dialog>
    </>
  );
}
