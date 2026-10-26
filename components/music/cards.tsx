'use client';
import Link from 'next/link';
import { useMemo } from 'react';
import { motion } from 'motion/react';
import type { Album, Artist, Playlist, PlayContext, Track } from '@/types/music';
import { Artwork, TrackArtwork } from './artwork';
import { PlayButton } from './play-button';
import { Equalizer } from './equalizer';
import { useIsPlayingContext, usePlayCollection, type CollectionKind } from '@/hooks/use-play-collection';
import { useTrackState } from '@/hooks/use-player';
import { usePlayerStore } from '@/store/player-store';
import { useUIStore } from '@/store/ui-store';
import { artistNames, cn, initials } from '@/utils/format';

const lift = { rest: { y: 0 }, hover: { y: -6 } };

function CardShell({ href, children, className, onContextMenu }: { href: string; children: React.ReactNode; className?: string; onContextMenu?: (e: React.MouseEvent) => void }) {
  return (
    <motion.div initial="rest" whileHover="hover" animate="rest" variants={lift} transition={{ type: 'spring', stiffness: 380, damping: 26 }}
      className={cn('group relative w-[9.5rem] shrink-0 snap-start sm:w-[11rem]', className)} onContextMenu={onContextMenu}>
      <div className="rounded-2xl p-2.5 transition-colors duration-300 group-hover:bg-white/[0.06] group-focus-within:bg-white/[0.06]">
        {children}
      </div>
      <Link href={href} className="absolute inset-0 z-0 rounded-2xl" aria-hidden="true" tabIndex={-1} />
    </motion.div>
  );
}

function HoverPlay({ playing, loading, onClick, label }: { playing: boolean; loading?: boolean; onClick: () => void; label: string }) {
  return (
    <div className={cn(
      'absolute bottom-2 right-2 z-10 transition duration-300',
      playing ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0 group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:translate-y-0 group-hover:opacity-100',
    )}>
      <PlayButton size="md" playing={playing} loading={loading} label={label} onClick={e => { e.preventDefault(); e.stopPropagation(); onClick(); }} />
    </div>
  );
}

/** Card for albums and curated playlists. Tracks are fetched only when play is pressed. */
export function CollectionCard({ kind, item }: { kind: Extract<CollectionKind, 'album' | 'playlist'>; item: Album | Playlist }) {
  const title = item.title;
  const href = `/${kind}/${item.id}`;
  const context = useMemo<PlayContext>(() => ({ label: title, href }), [title, href]);
  const { play, loading } = usePlayCollection(kind, item.id, context);
  const playing = useIsPlayingContext(title);
  const subtitle = 'artists' in item ? `${item.type} · ${artistNames(item.artists)}` : item.description;
  return (
    <CardShell href={href}>
      <div className="relative">
        <motion.div variants={{ rest: { scale: 1 }, hover: { scale: 1.03 } }} transition={{ duration: 0.4 }}>
          <Artwork art={item.artwork} className="aspect-square w-full shadow-card" label={kind === 'playlist' ? title : undefined} />
        </motion.div>
        <HoverPlay playing={playing} loading={loading} onClick={() => (playing ? usePlayerStore.getState().pause() : play())} label={playing ? `Pause ${title}` : `Play ${title}`} />
      </div>
      <Link href={href} className="relative z-10 mt-3 block truncate font-semibold text-mist">{title}</Link>
      <p className="mt-0.5 line-clamp-2 text-[0.8rem] leading-snug text-muted">{subtitle}</p>
    </CardShell>
  );
}

/** Card for a single track inside a shelf; plays within the shelf's track list. */
export function TrackCard({ track, onPlay }: { track: Track; onPlay: () => void }) {
  const { current, playing } = useTrackState(track.id);
  const openMenu = useUIStore(s => s.openTrackMenu);
  const href = track.album ? `/album/${track.album.id}` : `/artist/${track.artists[0]?.id}`;
  return (
    <CardShell href={href} onContextMenu={e => { e.preventDefault(); openMenu({ track, x: e.clientX, y: e.clientY }); }}>
      <div className="relative">
        <motion.div variants={{ rest: { scale: 1 }, hover: { scale: 1.03 } }} transition={{ duration: 0.4 }}>
          <TrackArtwork track={track} className="aspect-square w-full shadow-card" />
        </motion.div>
        {current && <span className="absolute left-2 top-2 rounded-full bg-ink-950/70 px-2 py-1.5 backdrop-blur"><Equalizer playing={playing} className="h-3" /></span>}
        <HoverPlay playing={playing} onClick={() => (current ? usePlayerStore.getState().togglePlay() : onPlay())} label={playing ? `Pause ${track.title}` : `Play ${track.title}`} />
      </div>
      <button type="button" onClick={onPlay} className={cn('relative z-10 mt-3 block max-w-full truncate text-left font-semibold', current ? 'text-accent' : 'text-mist')}>{track.title}</button>
      <p className="mt-0.5 truncate text-[0.8rem] text-muted">{artistNames(track.artists)}</p>
    </CardShell>
  );
}

export function TrackCards({ tracks, context }: { tracks: Track[]; context: PlayContext }) {
  return <>{tracks.map((t, i) => <TrackCard key={t.id} track={t} onPlay={() => usePlayerStore.getState().playTracks(tracks, i, context)} />)}</>;
}

export function ArtistCard({ artist }: { artist: Pick<Artist, 'id' | 'name' | 'artwork'> }) {
  return (
    <CardShell href={`/artist/${artist.id}`} className="w-[8.5rem] sm:w-[10rem]">
      <motion.div variants={{ rest: { scale: 1 }, hover: { scale: 1.05 } }} transition={{ duration: 0.4 }} className="relative">
        <Artwork art={artist.artwork} rounded="rounded-full" className="aspect-square w-full shadow-card" />
        <span className="absolute inset-0 grid place-items-center font-display text-4xl font-extrabold text-white/90 drop-shadow-lg">{initials(artist.name)}</span>
      </motion.div>
      <Link href={`/artist/${artist.id}`} className="relative z-10 mt-3 block truncate text-center font-semibold text-mist">{artist.name}</Link>
      <p className="text-center text-[0.8rem] text-muted">Artist</p>
    </CardShell>
  );
}

