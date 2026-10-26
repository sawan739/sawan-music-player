import { ShelfSkeleton, Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div role="status" aria-label="Loading" className="space-y-10 pt-4">
      <div className="px-4 sm:px-8"><Skeleton className="h-10 w-72" /></div>
      <div className="px-4 sm:px-8"><Skeleton className="h-[19rem] w-full rounded-3xl" /></div>
      <ShelfSkeleton />
      <ShelfSkeleton round />
    </div>
  );
}
