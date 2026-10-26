import { localCatalog } from './local-catalog';
import type { MusicCatalog } from './types';

/**
 * The catalog used by every page. To connect a real provider, implement
 * `MusicCatalog` (see ./types.ts) in a new file and select it here, e.g.
 *
 *   export const catalog = process.env.MUSIC_PROVIDER === 'myapi' ? myApiCatalog : localCatalog;
 *
 * Keep provider credentials server-side: pages call the catalog from Server
 * Components and the client only talks to /api/* route handlers.
 */
export const catalog: MusicCatalog = localCatalog;

export type * from './types';
