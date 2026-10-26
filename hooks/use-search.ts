'use client';
import { useEffect, useState } from 'react';
import type { SearchResults } from '@/services/catalog/types';
import { useDebouncedValue } from './use-debounced-value';

type SearchState = { results: SearchResults | null; loading: boolean; error: string | null };

const cache = new Map<string, SearchResults>();

/** Debounced, cancellable search against /api/search with an in-memory cache. */
export function useSearch(query: string, delay = 250): SearchState {
  const q = useDebouncedValue(query.trim(), delay);
  const [state, setState] = useState<SearchState>({ results: null, loading: false, error: null });

  useEffect(() => {
    if (!q) { setState({ results: null, loading: false, error: null }); return; }
    const hit = cache.get(q.toLowerCase());
    if (hit) { setState({ results: hit, loading: false, error: null }); return; }
    const controller = new AbortController();
    setState(s => ({ ...s, loading: true, error: null }));
    fetch(`/api/search?q=${encodeURIComponent(q)}`, { signal: controller.signal })
      .then(async res => {
        if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? 'Search failed.');
        return res.json() as Promise<SearchResults>;
      })
      .then(results => {
        cache.set(q.toLowerCase(), results);
        setState({ results, loading: false, error: null });
      })
      .catch(err => {
        if (err.name === 'AbortError') return;
        setState({ results: null, loading: false, error: navigator.onLine ? err.message : 'You are offline.' });
      });
    return () => controller.abort();
  }, [q]);

  // While the user is still typing, report loading so the UI can show skeletons.
  return query.trim() && query.trim() !== q ? { ...state, loading: true } : state;
}
