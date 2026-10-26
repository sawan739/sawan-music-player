export function formatTime(seconds: number | null | undefined) {
  if (seconds == null || !Number.isFinite(seconds) || seconds < 0) return '--:--';
  const s = Math.floor(seconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const rest = String(s % 60).padStart(2, '0');
  return h ? `${h}:${String(m).padStart(2, '0')}:${rest}` : `${m}:${rest}`;
}

/** "1 hr 12 min" / "14 min" style summary for collection headers. */
export function formatTotalDuration(seconds: number) {
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min`;
  return `${Math.floor(minutes / 60)} hr ${minutes % 60} min`;
}

export function formatDate(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

export const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

export function artistNames(artists: { name: string }[]) {
  return artists.map(a => a.name).join(', ');
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9ऀ-ॿ]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'x';
}

export function shuffled<T>(items: readonly T[]) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

/** Up to two initials for artist avatars. */
export const initials = (name: string) =>
  name.replace(/[^\p{L}\s]/gu, '').split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase() || '♪';
