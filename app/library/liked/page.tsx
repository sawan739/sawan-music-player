'use client';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { useLibraryStore, selectLikedTracks } from '@/store/library-store';
import { useUIStore } from '@/store/ui-store';
import { CollectionHeader } from '@/components/music/collection-header';
import { CollectionActions } from '@/components/music/collection-actions';
import { TrackList } from '@/components/music/track-list';
import { CollectionSkeleton } from '@/components/ui/skeleton';
import { plural } from '@/utils/format';

const CONTEXT = { label: 'Liked Songs', href: '/library/liked' };

export default function LikedPage() {
  const hydrated = useUIStore(s => s.hydrated);
  const tracks = useLibraryStore(useShallow(selectLikedTracks));
  if (!hydrated) return <CollectionSkeleton />;
  return (
    <>
      <CollectionHeader
        palette={['#f472b6', '#7c3aed', '#1e1b4b']}
        art={<div className="grid aspect-square place-items-center rounded-2xl bg-gradient-to-br from-dusk-500 via-blush-500 to-rain-400"><Heart size={72} fill="white" className="text-white drop-shadow-xl" /></div>}
        eyebrow="Playlist"
        title="Liked Songs"
        meta={<><span className="font-bold text-white">Sawan</span><span aria-hidden="true">•</span><span>{plural(tracks.length, 'song')}</span></>}
      />
      <CollectionActions tracks={tracks} context={CONTEXT} />
      <section className="px-2 sm:px-6" aria-label="Liked songs">
        {tracks.length ? (
          <TrackList tracks={tracks} context={CONTEXT} showAlbum showHeader />
        ) : (
          <div className="px-3 py-14 text-center">
            <p className="font-display text-xl font-bold">Songs you like will appear here</p>
            <p className="mt-1 text-sm text-muted">Tap the heart on any song to save it.</p>
            <Link href="/discover" className="btn-primary mt-6">Find songs</Link>
          </div>
        )}
      </section>
    </>
  );
}
