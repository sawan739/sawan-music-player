# Sawan Music — Feel every drop

A modern, animated music-streaming web app built for **Sawan**. It is inspired by JioSaavn and Spotify, with its own monsoon-themed brand: a raindrop logo holding a live sound wave, teal → violet → pink gradients, glass surfaces, and an ambient background that takes its colours from whatever is playing.

Built with **Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS 3 · Motion (Framer Motion) · Zustand**.

## Quick start

```bash
npm install
cp .env.example .env.local   # optional: only needed for the YouTube library
npm run dev                  # http://localhost:3000
```

Node.js 20.9+ is required. The **Sawan Originals** (12 tracks, 5 albums/EPs) play immediately with no keys and no network, because the audio is bundled in `public/audio/originals/`.

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build / serve |
| `npm run typecheck` (alias `lint`) | TypeScript checks |
| `npm run generate:audio` | Re-render the Sawan Originals MP3s (see below) |
| `npm run resolve:all` | Pre-resolve YouTube video IDs for the 235-song library |

> `next/font` downloads Plus Jakarta Sans and Sora from Google Fonts at **build** time, so builds need network access. If a build fails with a `next/font` error, retry.

## Features

**Pages:** Home (time-aware greeting, quick picks, featured carousel, trending, new releases, curated mixes, moods, popular artists, recently played) · Search (debounced, cancellable, top result, songs/artists/albums/playlists, recent searches, browse tiles, loading/empty/error states) · Discover (moods, genres, languages, editor's picks) · genre/mood/language pages · Artist (bio, popular songs, discography, playlists, "fans also like", follow) · Album (track list, release info, save) · Playlist · Your Library (playlists, saved albums, followed artists, history) · Liked Songs · user playlists (create, rename, describe, add/remove songs, drag-to-reorder, delete).

**Player:** play/pause, next/previous, seek (with drag preview), volume and mute, shuffle (restores the original order when switched off), repeat off/all/one, queue (play next, add to queue, drag-to-reorder, remove, clear), play whole albums/playlists, likes, history, and a mini player. The immersive **Now Playing** view has a spinning vinyl and swipes down to close. Playback persists across navigation, and **the track and position resume after a page reload**. It also handles loading, buffering, unavailable-track and error states with auto-skip (stopping after 3 failures in a row), and integrates with Media Session for lock-screen and hardware keys.

**Keyboard shortcuts** (press `?` in the app): `Space` play/pause · `Shift+→/←` next/previous · `→/←` seek ±5s · `↑/↓` volume · `M` mute · `L` like · `S` shuffle · `R` repeat · `F` Now Playing · `Q` queue · `/` or `Ctrl+K` search · `Esc` close.

**Motion:** page transitions, staggered lists and grids, shelves that reveal on scroll, card lift and play-button reveal, an icon morph on play/pause, a heart-burst like animation, a spring-physics Now Playing sheet, a swipeable mini player and carousel, drag-to-reorder lists, animated sliders, skeleton shimmer, dialog/drawer/menu transitions, equalizer bars, and an aurora background tinted by the current artwork. Decorative loops **pause when playback pauses**, and **`prefers-reduced-motion` is respected** (Motion's `reducedMotion="user"` plus a CSS override).

**Accessibility:** semantic landmarks, a skip link, labelled controls, `aria-pressed`/`aria-current`, sliders built on native range inputs (keyboard and screen-reader support), focus-trapped dialogs that restore focus, arrow-key navigation in the track menu, visible focus rings, and live-region toasts.

## Architecture

```text
app/                      Routes (Server Components fetch through the catalog service)
  page.tsx                Home
  search/ discover/ album/[id]/ artist/[id]/ playlist/[id]/ discover/[facet]/[id]/
  library/ (+ liked/, playlist/[id]/)    Client views over the persisted library
  api/search  api/collection/[kind]/[id]  api/resolve   Route handlers
  layout.tsx · template.tsx (page transitions) · loading.tsx (skeletons) · error.tsx · not-found.tsx
components/
  shell/                  AppShell, Sidebar, TopBar, MobileNav, AmbientBackground, Toaster, TrackMenu, dialogs
  player/                 PlaybackHost, PlayerBar + MiniPlayer, NowPlaying, QueueDrawer/QueueList, controls, YouTubeDock
  music/                  Artwork (procedural SVG covers), cards, Shelf, TrackList, CollectionHeader/Actions, LikeButton…
  home/ search/ library/  Page-specific client views
  ui/                     Slider, Dialog, Skeleton
services/
  catalog/                MusicCatalog interface + localCatalog implementation   ← metadata seam
  audio/                  PlaybackEngine interface, HtmlAudioEngine, YouTubeEngine, PlaybackController  ← playback seam
  youtube/                Server-side YouTube search; client-side videoId resolution and cache
store/                    Zustand: player-store (single source of truth for playback), library-store, ui-store
hooks/                    usePlayer selectors, useTrackActions, useSearch, usePlayCollection, useKeyboardShortcuts…
data/                     taxonomy, originals (demo catalog), library (your 235 songs + tags), playlists, songs.json
types/music.ts            Track, Artist, Album, Playlist, Artwork, …
utils/                    format, colour helpers
styles/globals.css        Design tokens, component classes, reduced-motion rules
scripts/                  generate-demo-audio.ts, resolve-all.ts
```

### Playback data flow

```text
UI (buttons, sliders, shortcuts, Media Session)
      │ actions
      ▼
player-store (Zustand) ── single source of truth: queue, index, status, position, volume, shuffle, repeat
      │ load/play/pause/seek                         ▲ status / time / error events
      ▼                                              │
PlaybackController ── picks the engine by track.source.kind, stops the other, drops stale events
      ├── HtmlAudioEngine  → one shared HTMLAudioElement (Sawan Originals or any audio URL)
      └── YouTubeEngine    → one IFrame player inside <YouTubeDock/> (your library)
```

Key decisions:

- **Presentation never touches media elements.** Components call store actions; only engines own `<audio>` and the YouTube iframe. `PlaybackHost` (mounted once in the shell) wires engine events into the store and handles hydration, history, error auto-skip, resume position and Media Session.
- **Only one thing ever plays.** The controller keeps exactly one active engine and token-guards async loads, so a slow YouTube lookup can't start after you've moved on. This is verified in a browser test.
- **Re-render discipline.** Progress updates live in their own selector (`useProgress`), so controls don't re-render four times a second. Rows subscribe only to "am I current/playing?" booleans. Progress fills use `transform: scaleX`.
- **Persistence.** The `sawan-player` key (queue, index, volume, shuffle, repeat, resume position) and the `sawan-library` key (likes, playlists, history, saved albums, followed artists, recent searches, resolved video IDs) live in `localStorage`. Both stores use `skipHydration` and rehydrate on the client to avoid SSR mismatches. **Nothing sensitive is persisted.** The API key stays server-side.
- **Server Components fetch, client components interact.** Pages call `catalog.*` on the server and are statically generated (321 pages). Cards fetch a collection's tracks lazily (`/api/collection/...`) only when you press play, which keeps page payloads small.
- **Procedural artwork.** Covers are deterministic SVG compositions (waves, rain, synthwave sun, mandala…) from a palette and seed, so there are no image downloads and no licensing questions. When a real image exists (a YouTube thumbnail once a song is resolved, or provider artwork via `artwork.url`) it is layered on top, with fallback on error.
- **The YouTube player stays visible.** YouTube's terms forbid hidden or audio-only playback and require at least 200×200. The single iframe is never re-parented, which would reload it. It is positioned as a draggable 200×200 mini player, or docked over a slot inside Now Playing, and moved offscreen only when a non-YouTube track plays (YouTube is stopped first).

## Music sources

### 1. Sawan Originals (bundled, authorized)

There are 12 instrumental tracks by fictional demo artists (Sawan & The Clouds, Neel Akash, Kaagaz Kites, Tara & The Tanpura, Midnight Chai). **Every sound is synthesised from code** in `scripts/generate-demo-audio.ts`: pads, FM electric piano, Karplus-Strong plucks (a sitar-like tone), synthesised drums, tabla (bayan/dayan) in a teentaal pattern, a tanpura drone, rain and vinyl crackle. It's all encoded to 128 kbps MP3 with a pure-JS encoder. Because no samples or third-party recordings are used, the audio is owned by this project. To tweak a track, edit its recipe and run `npm run generate:audio` (use `npm run generate:audio -- <id>` for a single track).

### 2. Your 235-song library (YouTube)

`data/songs.json` is streamed through the official YouTube IFrame player, exactly as before. Song → video lookup happens server-side via `/api/resolve`, which needs `YOUTUBE_API_KEY`:

1. In Google Cloud Console, enable **YouTube Data API v3** and create an **API key** restricted to that API.
2. Put it in `.env.local` as `YOUTUBE_API_KEY=...`. Never use a `NEXT_PUBLIC_` variable, and never commit the key.
3. Optionally, run `npm run resolve:all` and commit `data/resolved.json`, so lookups (100+ quota units each) are spent once. The default quota of 10,000 units/day covers roughly 95 lookups. Resolved IDs are also cached per browser.

Without a key, the library still browses fine. Its songs show a clear "not configured" error and auto-skip, while the Originals keep working. Genre, language and mood tags for library songs are **best-effort** (from artist and title keywords). Fix any mistakes in `data/library.ts`.

### Connecting a real music provider

1. **Metadata:** implement `MusicCatalog` (`services/catalog/types.ts`) for your provider, for example a licensed catalog API or your own backend. Map responses to the shared types in `types/music.ts`, and select it in `services/catalog/index.ts` (e.g. by a `MUSIC_PROVIDER` env var). Keep credentials server-side: pages already call the catalog from Server Components, and the client only uses `/api/*`.
2. **Audio:** if the provider gives licensed stream URLs, return `source: { kind: 'audio', url }`. The existing `HtmlAudioEngine` plays them, so no player changes are needed. For SDK-based players, add a `TrackSource` kind and a matching `PlaybackEngine`, then register it in `PlaybackController.engineFor`.
3. **Artwork:** set `artwork.url`. Procedural art remains the fallback.
4. **Accounts/sync:** swap the `persist` storage in `store/library-store.ts` for an API-backed storage adapter once you have auth.

No real provider is wired up here; none is configured, and the mock layer is intentionally honest about that.

## Testing notes for this corrected package (2026-10-26)

Static checks passed for all 235 playlist records (required fields and unique IDs), the resolved-video cache format, the presence of retry/cache-invalidation paths, the environment-variable configuration, and PWA assets. The downloadable ZIP also passed an archive-integrity check and excludes `.env.local`, `.next`, and `node_modules`.

**Not independently verified in this environment:** `npm ci`, TypeScript compilation, `next build`, and real YouTube playback. Dependency installation could not complete because the npm registry was not reachable/cached, and no usable YouTube API key was available for end-to-end testing. Do not treat this package as verified for production deployment until you run `npm ci && npm run typecheck && npm run build` and manually play several library tracks in a browser using your key. A successful build alone cannot guarantee every YouTube video will be embeddable or available in every region.

## Known limitations

- **YouTube constraints:** embeds can show ads or recommendations, may be region-blocked or have embedding disabled (the app auto-skips), and iOS may limit background playback. Seeking and duration for YouTube tracks are known only once playback starts.
- **Quota:** first-time lookups use the YouTube API quota. The server can't persist new lookups on read-only hosts (e.g. Vercel), so use `npm run resolve:all` for a shared cache.
- **Local-only library:** likes, playlists and history live in this browser's `localStorage` (no accounts or cross-device sync yet).
- **Visualizers are decorative:** they're animated in time with play/pause, not driven by an audio analyser.
- **iOS Safari** ignores programmatic volume changes on `<audio>`, so the hardware buttons control volume there.
- **No offline mode:** the service worker is intentionally omitted, since YouTube streams can't be cached.

## Playback troubleshooting (updated)

- The uploaded version contained **235 tracks but zero pre-resolved YouTube IDs** (`data/resolved.json` was `{}`). Until IDs are cached, each library track needs a YouTube API search, which consumes quota and can fail.
- The player now retries alternative embeddable videos when YouTube reports that a selected video is unavailable or embedding is blocked. These retries consume additional search quota. A video can still be blocked by copyright, region, age gating, or YouTube's embedding rules.
- Put a valid `YOUTUBE_API_KEY` in `.env.local` and ensure the YouTube Data API v3 is enabled. `npm run resolve:all` can be rerun after quota resets; it skips previously resolved songs. Commit `data/resolved.json` to persist those results to Vercel. Never commit `.env.local`.
- Browser caches may contain stale video IDs. The app now invalidates IDs that produce a recognized YouTube playback error. Clear this site's local storage if an older deployment has inconsistent state.
- The ZIP intentionally excludes `.env.local`, `.next`, and dependencies. Run `npm install` then `npm run dev` locally. Runtime verification requires a working Google API key and browser.
