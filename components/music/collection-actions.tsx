'use client';
import { motion } from 'motion/react';
import { Check, ListEnd, ListPlus, Plus, Shuffle, UserCheck, UserPlus } from 'lucide-react';
import type { AlbumSummary, ArtistSummary, PlayContext, Track } from '@/types/music';
import { PlayButton } from './play-button';
import { useTrackActions } from '@/hooks/use-library';
import { useLibraryStore } from '@/store/library-store';
import { usePlayerStore } from '@/store/player-store';
import { useUIStore } from '@/store/ui-store';
import { cn } from '@/utils/format';

type Props = {
  tracks: Track[];
  context: PlayContext;
  album?: AlbumSummary;
  artist?: ArtistSummary;
  children?: React.ReactNode;
};

/** Play / shuffle / save / follow bar shown under every collection header. */
export function CollectionActions({ tracks, context, album, artist, children }: Props) {
  const playingHere = usePlayerStore(s => s.context?.label === context.label && (s.status === 'playing' || s.status === 'buffering'));
  const loadedHere = usePlayerStore(s => s.context?.label === context.label);
  const saved = useLibraryStore(s => (album ? s.savedAlbums.some(a => a.id === album.id) : false));
  const following = useLibraryStore(s => (artist ? s.followedArtists.some(a => a.id === artist.id) : false));
  const actions = useTrackActions();
  const empty = tracks.length === 0;

  const play = () => {
    if (loadedHere) usePlayerStore.getState().togglePlay();
    else usePlayerStore.getState().playTracks(tracks, 0, context, { shuffle: false });
  };

  return (
    <div className="flex flex-wrap items-center gap-3 px-4 py-5 sm:px-8">
      <PlayButton size="lg" playing={playingHere} label={playingHere ? `Pause ${context.label}` : `Play ${context.label}`} onClick={play} className={cn(empty && 'pointer-events-none opacity-40')} />
      <motion.button whileTap={{ scale: 0.9 }} type="button" disabled={empty} onClick={() => usePlayerStore.getState().playTracks(tracks, 0, context, { shuffle: true })} aria-label={`Shuffle ${context.label}`} className="icon-btn h-12 w-12 border border-white/10">
        <Shuffle size={20} />
      </motion.button>
      {album && (
        <motion.button whileTap={{ scale: 0.9 }} type="button" onClick={() => actions.toggleSaveAlbum(album)} aria-pressed={saved} aria-label={saved ? 'Remove from library' : 'Save to library'} className={cn('icon-btn h-12 w-12 border border-white/10', saved && 'border-rain-400/40 text-rain-400 hover:text-rain-400')}>
          {saved ? <Check size={20} /> : <Plus size={20} />}
        </motion.button>
      )}
      {artist && (
        <motion.button whileTap={{ scale: 0.95 }} type="button" onClick={() => actions.toggleFollow(artist)} aria-pressed={following} className={cn('btn-ghost', following && 'border-rain-400/40 text-rain-300')}>
          {following ? <UserCheck size={17} /> : <UserPlus size={17} />} {following ? 'Following' : 'Follow'}
        </motion.button>
      )}
      <motion.button whileTap={{ scale: 0.9 }} type="button" disabled={empty} onClick={() => actions.addToQueue(tracks)} aria-label="Add all to queue" className="icon-btn h-12 w-12 border border-white/10"><ListEnd size={20} /></motion.button>
      <motion.button whileTap={{ scale: 0.9 }} type="button" disabled={empty} onClick={() => useUIStore.getState().openPlaylistPicker(tracks)} aria-label="Add all to a playlist" className="icon-btn h-12 w-12 border border-white/10"><ListPlus size={20} /></motion.button>
      {children}
    </div>
  );
}
