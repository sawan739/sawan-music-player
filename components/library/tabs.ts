/** Library tab ids. Plain module so both the server page and the client view can import it. */
export const LIBRARY_TABS = [
  { id: 'playlists', label: 'Playlists' },
  { id: 'albums', label: 'Albums' },
  { id: 'artists', label: 'Artists' },
  { id: 'recent', label: 'Recently played' },
] as const;

export type LibraryTab = (typeof LIBRARY_TABS)[number]['id'];

export const parseLibraryTab = (value: string | undefined): LibraryTab =>
  LIBRARY_TABS.find(t => t.id === value)?.id ?? 'playlists';
