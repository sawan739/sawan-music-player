import type { Metadata } from 'next';
import { LibraryView } from '@/components/library/library-view';
import { parseLibraryTab } from '@/components/library/tabs';

export const metadata: Metadata = { title: 'Your Library' };

export default async function LibraryPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  return <LibraryView initialTab={parseLibraryTab((await searchParams).tab)} />;
}
