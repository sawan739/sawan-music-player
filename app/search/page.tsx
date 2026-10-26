import type { Metadata } from 'next';
import { catalog } from '@/services/catalog';
import { SearchView } from '@/components/search/search-view';

export const metadata: Metadata = { title: 'Search' };

export default async function SearchPage() {
  const [moods, genres] = await Promise.all([catalog.listFacets('mood'), catalog.listFacets('genre')]);
  return <SearchView browse={[...moods, ...genres]} />;
}
