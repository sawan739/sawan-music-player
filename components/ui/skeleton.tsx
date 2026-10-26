import { cn } from '@/utils/format';

/** Shimmering placeholder block. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn('relative overflow-hidden rounded-lg bg-white/[0.06]', className)} aria-hidden="true">
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/[0.07] to-transparent" />
    </div>
  );
}

export function TrackListSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-1" aria-hidden="true">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-3 px-3 py-2" style={{ opacity: 1 - i * 0.08 }}>
          <Skeleton className="h-4 w-5" />
          <Skeleton className="h-11 w-11 rounded-lg" />
          <div className="flex-1 space-y-2"><Skeleton className="h-3.5 w-2/5" /><Skeleton className="h-3 w-1/4" /></div>
          <Skeleton className="hidden h-3 w-10 sm:block" />
        </div>
      ))}
    </div>
  );
}

export function ShelfSkeleton({ round = false }: { round?: boolean }) {
  return (
    <div className="px-4 sm:px-8" aria-hidden="true">
      <Skeleton className="mb-4 h-6 w-48" />
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 7 }, (_, i) => (
          <div key={i} className="w-[9rem] shrink-0 sm:w-[10.5rem]">
            <Skeleton className={cn('aspect-square w-full', round ? 'rounded-full' : 'rounded-xl')} />
            <Skeleton className="mt-3 h-3.5 w-3/4" />
            <Skeleton className="mt-2 h-3 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function CollectionSkeleton() {
  return (
    <div role="status" aria-label="Loading">
      <div className="flex flex-col items-center gap-6 px-4 pb-6 pt-8 sm:flex-row sm:items-end sm:px-8">
        <Skeleton className="h-48 w-48 rounded-2xl sm:h-56 sm:w-56" />
        <div className="w-full max-w-lg space-y-3">
          <Skeleton className="mx-auto h-3 w-20 sm:mx-0" />
          <Skeleton className="mx-auto h-12 w-3/4 sm:mx-0" />
          <Skeleton className="mx-auto h-4 w-1/2 sm:mx-0" />
        </div>
      </div>
      <div className="flex gap-3 px-4 py-5 sm:px-8"><Skeleton className="h-14 w-14 rounded-full" /><Skeleton className="h-12 w-12 rounded-full" /><Skeleton className="h-12 w-12 rounded-full" /></div>
      <div className="px-2 sm:px-6"><TrackListSkeleton /></div>
    </div>
  );
}
