'use client';
import { useState } from 'react';
import type { PlayContext, Track } from '@/types/music';
import { TrackList } from './track-list';

/** Shows the first `initial` tracks with a "Show all" toggle, while playback always uses the full list. */
export function ExpandableTrackList({ tracks, context, initial = 5, showAlbum }: { tracks: Track[]; context: PlayContext; initial?: number; showAlbum?: boolean }) {
  const [open, setOpen] = useState(false);
  const shown = open ? tracks : tracks.slice(0, initial);
  return (
    <div>
      <TrackList tracks={shown} context={context} showAlbum={showAlbum} />
      {tracks.length > initial && (
        <button type="button" onClick={() => setOpen(!open)} className="ml-3 mt-2 text-sm font-semibold text-muted transition hover:text-mist">
          {open ? 'Show less' : `Show all ${tracks.length}`}
        </button>
      )}
    </div>
  );
}
