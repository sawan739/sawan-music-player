'use client';
import { useEffect } from 'react';
import { RotateCcw } from 'lucide-react';

/** Route-level error boundary: the shell and player keep running while this page recovers. */
export default function RouteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <div role="alert" className="grid min-h-[50vh] place-items-center px-6 text-center">
      <div>
        <h1 className="font-display text-2xl font-extrabold">Something went off-beat</h1>
        <p className="mt-2 text-muted">This page hit an error. Your music keeps playing.</p>
        <button type="button" onClick={reset} className="btn-primary mt-6"><RotateCcw size={16} /> Try again</button>
      </div>
    </div>
  );
}
