/**
 * Procedurally renders the "Sawan Originals" demo tracks to MP3.
 *
 * Every note, drum hit and rain drop is synthesised here from maths, so the
 * output is original audio owned by this project — no samples or third-party
 * recordings are used. Output: public/audio/originals/<id>.mp3 and
 * data/originals-audio.json (durations in seconds).
 *
 *   npm run generate:audio
 */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const SR = 44100;
const TAU = Math.PI * 2;

type Style = 'lofi' | 'chillhop' | 'synthwave' | 'pop' | 'fusion' | 'folk';
type Recipe = {
  id: string;
  seconds: number;
  bpm: number;
  root: number; // MIDI note of the tonic
  scale: number[]; // 7-note parent scale, semitones from root
  progression: number[]; // scale degrees, one chord per bar
  style: Style;
  seed: number;
  rain?: boolean;
};

const SCALES = {
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  bhairav: [0, 1, 4, 5, 7, 8, 11],
  hijaz: [0, 1, 4, 5, 7, 8, 10],
};

export const RECIPES: Recipe[] = [
  { id: 'first-rain', seconds: 84, bpm: 76, root: 62, scale: SCALES.minor, progression: [0, 5, 3, 4], style: 'lofi', seed: 11, rain: true },
  { id: 'chai-on-the-balcony', seconds: 80, bpm: 84, root: 65, scale: SCALES.major, progression: [1, 4, 0, 5], style: 'lofi', seed: 23 },
  { id: 'wet-streets-warm-lights', seconds: 88, bpm: 72, root: 60, scale: SCALES.dorian, progression: [0, 6, 5, 3], style: 'lofi', seed: 37, rain: true },
  { id: 'neon-dhaba', seconds: 82, bpm: 112, root: 57, scale: SCALES.minor, progression: [0, 5, 2, 6], style: 'synthwave', seed: 41 },
  { id: 'ring-road-run', seconds: 78, bpm: 118, root: 64, scale: SCALES.minor, progression: [0, 2, 5, 6], style: 'synthwave', seed: 53 },
  { id: 'afterglow', seconds: 86, bpm: 96, root: 61, scale: SCALES.minor, progression: [5, 3, 0, 4], style: 'synthwave', seed: 67 },
  { id: 'morning-bhairav', seconds: 92, bpm: 88, root: 61, scale: SCALES.bhairav, progression: [0, 0, 1, 0], style: 'fusion', seed: 71 },
  { id: 'desert-caravan', seconds: 84, bpm: 104, root: 62, scale: SCALES.hijaz, progression: [0, 1, 0, 6], style: 'folk', seed: 83 },
  { id: 'dil-ki-baarish', seconds: 90, bpm: 102, root: 67, scale: SCALES.major, progression: [0, 4, 5, 3], style: 'pop', seed: 97, rain: true },
  { id: 'baadal', seconds: 84, bpm: 96, root: 62, scale: SCALES.major, progression: [5, 3, 0, 4], style: 'pop', seed: 101, rain: true },
  { id: 'golden-hour', seconds: 82, bpm: 90, root: 63, scale: SCALES.major, progression: [3, 4, 2, 5], style: 'chillhop', seed: 113 },
  { id: 'slow-mornings', seconds: 78, bpm: 80, root: 58, scale: SCALES.major, progression: [0, 5, 1, 4], style: 'chillhop', seed: 127 },
];

// ---------------------------------------------------------------- utilities

function rng(seed: number) {
  let s = (seed * 2654435761) >>> 0 || 1;
  return () => {
    s ^= s << 13; s >>>= 0;
    s ^= s >>> 17;
    s ^= s << 5; s >>>= 0;
    return s / 4294967296;
  };
}
const mtof = (m: number) => 440 * 2 ** ((m - 69) / 12);

function table(harmonics: (n: number) => number, count: number) {
  const size = 2048;
  const t = new Float32Array(size + 1);
  for (let n = 1; n <= count; n++) {
    const a = harmonics(n);
    if (!a) continue;
    for (let i = 0; i <= size; i++) t[i] += a * Math.sin((TAU * n * i) / size);
  }
  let peak = 0;
  for (const v of t) peak = Math.max(peak, Math.abs(v));
  for (let i = 0; i <= size; i++) t[i] /= peak;
  return t;
}
const TABLES = {
  sine: table(n => (n === 1 ? 1 : 0), 1),
  warm: table(n => (1 / n) * Math.exp(-n / 9), 24),
  square: table(n => (n % 2 ? 1 / n : 0), 15),
  organ: table(n => ({ 1: 1, 2: 0.6, 3: 0.35, 4: 0.25, 6: 0.12, 8: 0.08 } as Record<number, number>)[n] ?? 0, 8),
};

function osc(tab: Float32Array, freq: number, length: number, phase = 0) {
  const out = new Float32Array(length);
  const size = tab.length - 1;
  let p = phase * size;
  const inc = (freq * size) / SR;
  for (let i = 0; i < length; i++) {
    const idx = p | 0;
    const frac = p - idx;
    out[i] = tab[idx] + (tab[idx + 1] - tab[idx]) * frac;
    p += inc;
    if (p >= size) p -= size;
  }
  return out;
}

function envelope(buf: Float32Array, a: number, d: number, s: number, r: number) {
  const n = buf.length;
  const A = Math.max(1, a * SR), D = Math.max(1, d * SR), R = Math.max(1, r * SR);
  const relStart = Math.max(0, n - R);
  for (let i = 0; i < n; i++) {
    let g = i < A ? i / A : i < A + D ? 1 - ((i - A) / D) * (1 - s) : s;
    if (i >= relStart) g *= 1 - (i - relStart) / R;
    buf[i] *= g;
  }
  return buf;
}

function lowpass(buf: Float32Array, cutoff: number) {
  const a = 1 - Math.exp((-TAU * cutoff) / SR);
  let y = 0;
  for (let i = 0; i < buf.length; i++) { y += a * (buf[i] - y); buf[i] = y; }
  return buf;
}
function highpass(buf: Float32Array, cutoff: number) {
  const a = 1 - Math.exp((-TAU * cutoff) / SR);
  let y = 0;
  for (let i = 0; i < buf.length; i++) { y += a * (buf[i] - y); buf[i] -= y; }
  return buf;
}

// ---------------------------------------------------------------- mix bus

class Bus {
  L: Float32Array; R: Float32Array; sL: Float32Array; sR: Float32Array;
  constructor(public length: number) {
    this.L = new Float32Array(length); this.R = new Float32Array(length);
    this.sL = new Float32Array(length); this.sR = new Float32Array(length);
  }
  add(start: number, sig: Float32Array, gain: number, pan = 0, send = 0.2) {
    const s0 = Math.round(start * SR);
    const lg = Math.cos(((pan + 1) * Math.PI) / 4) * gain;
    const rg = Math.sin(((pan + 1) * Math.PI) / 4) * gain;
    for (let i = 0; i < sig.length; i++) {
      const j = s0 + i;
      if (j < 0) continue;
      if (j >= this.length) break;
      const v = sig[i];
      this.L[j] += v * lg; this.R[j] += v * rg;
      this.sL[j] += v * lg * send; this.sR[j] += v * rg * send;
    }
  }
}

function reverb(input: Float32Array, offset: number, room = 0.84, damp = 0.3) {
  const scale = SR / 44100;
  const combs = [1116, 1188, 1277, 1356, 1422, 1491].map(c => Math.round((c + offset) * scale));
  const allpasses = [556, 441, 341].map(c => Math.round((c + offset) * scale));
  const out = new Float32Array(input.length);
  for (const len of combs) {
    const buf = new Float32Array(len);
    let idx = 0, store = 0;
    for (let i = 0; i < input.length; i++) {
      const y = buf[idx];
      store = y * (1 - damp) + store * damp;
      buf[idx] = input[i] + store * room;
      out[i] += y;
      if (++idx >= len) idx = 0;
    }
  }
  for (const len of allpasses) {
    const buf = new Float32Array(len);
    let idx = 0;
    for (let i = 0; i < out.length; i++) {
      const b = buf[idx];
      buf[idx] = out[i] + b * 0.5;
      out[i] = b - out[i];
      if (++idx >= len) idx = 0;
    }
  }
  return out;
}

// ---------------------------------------------------------------- instruments

const sec = (s: number) => Math.max(1, Math.round(s * SR));

function pad(freq: number, dur: number, bright = 1400) {
  const n = sec(dur + 0.8);
  const out = new Float32Array(n);
  for (const cents of [-9, 0, 8]) {
    const v = osc(TABLES.warm, freq * 2 ** (cents / 1200), n, Math.random());
    for (let i = 0; i < n; i++) out[i] += v[i] / 3;
  }
  return envelope(lowpass(out, bright), 0.5, 0.4, 0.8, 0.8);
}

function epiano(freq: number, dur: number) {
  const n = sec(dur + 0.6);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const index = 1.6 * Math.exp(-t * 3) + 0.25;
    const tine = 0.35 * Math.exp(-t * 30) * Math.sin(TAU * freq * 14 * t);
    out[i] = Math.sin(TAU * freq * t + index * Math.sin(TAU * freq * t)) + tine;
    out[i] *= Math.exp(-t * 1.6);
  }
  return envelope(out, 0.004, 0.1, 0.9, 0.35);
}

function pluck(freq: number, dur: number, rand: () => number, bright = 0.6, decay = 0.996) {
  const n = sec(dur + 0.4);
  const period = Math.max(2, Math.round(SR / freq));
  const out = new Float32Array(n);
  const line = new Float32Array(period);
  let prev = 0;
  for (let i = 0; i < period; i++) {
    const noise = rand() * 2 - 1;
    prev = prev + bright * (noise - prev);
    line[i] = prev;
  }
  let idx = 0;
  for (let i = 0; i < n; i++) {
    const next = (idx + 1) % period;
    const v = line[idx];
    line[idx] = decay * 0.5 * (v + line[next]);
    out[i] = v;
    idx = next;
  }
  return envelope(out, 0.002, 0.05, 1, 0.25);
}

function bass(freq: number, dur: number, tab = TABLES.sine, cutoff = 600) {
  const n = sec(dur);
  const a = osc(tab, freq, n);
  const b = osc(TABLES.sine, freq / 2, n);
  for (let i = 0; i < n; i++) a[i] = a[i] * 0.7 + b[i] * 0.45;
  return envelope(lowpass(a, cutoff), 0.005, 0.15, 0.75, 0.08);
}

function kick(punch = 1) {
  const n = sec(0.5);
  const out = new Float32Array(n);
  let ph = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    ph += (TAU * (45 + 110 * punch * Math.exp(-t * 32))) / SR;
    out[i] = Math.sin(ph) * Math.exp(-t * 7) + (i < 60 ? 0.3 * (1 - i / 60) : 0);
  }
  return out;
}
function snare(rand: () => number, tone = 185) {
  const n = sec(0.3);
  const noise = new Float32Array(n);
  for (let i = 0; i < n; i++) noise[i] = (rand() * 2 - 1) * Math.exp((-i / SR) * 16);
  highpass(noise, 1200);
  for (let i = 0; i < n; i++) noise[i] += 0.5 * Math.sin((TAU * tone * i) / SR) * Math.exp((-i / SR) * 28);
  return noise;
}
function clap(rand: () => number) {
  const n = sec(0.35);
  const out = new Float32Array(n);
  for (const off of [0, 0.011, 0.022]) {
    const s0 = Math.round(off * SR);
    for (let i = s0; i < n; i++) out[i] += (rand() * 2 - 1) * Math.exp(((-(i - s0)) / SR) * (off === 0.022 ? 14 : 90));
  }
  return lowpass(highpass(out, 900), 5000);
}
function hat(rand: () => number, open = false) {
  const n = sec(open ? 0.3 : 0.07);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) out[i] = (rand() * 2 - 1) * Math.exp((-i / SR) * (open ? 11 : 70));
  return highpass(highpass(out, 6000), 6000);
}
function shaker(rand: () => number) {
  const n = sec(0.12);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) { const t = i / SR; out[i] = (rand() * 2 - 1) * Math.min(1, t * 120) * Math.exp(-t * 35); }
  return lowpass(highpass(out, 3500), 9000);
}
/** Tabla: dayan (treble, harmonic overtones) and bayan (bass, upward pitch bend). */
function dayan(freq: number, ring = 9) {
  const n = sec(0.45);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    out[i] = (Math.sin(TAU * freq * t) + 0.5 * Math.sin(TAU * freq * 2 * t) * Math.exp(-t * 6) + 0.3 * Math.sin(TAU * freq * 3 * t) * Math.exp(-t * 12)) * Math.exp(-t * ring);
  }
  return out;
}
function bayan() {
  const n = sec(0.6);
  const out = new Float32Array(n);
  let ph = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    ph += (TAU * (85 + 35 * (1 - Math.exp(-t * 6)))) / SR;
    out[i] = Math.sin(ph) * Math.exp(-t * 5);
  }
  return out;
}
function droplet(rand: () => number) {
  const n = sec(0.08);
  const out = new Float32Array(n);
  const f0 = 1800 + rand() * 2600;
  let ph = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    ph += (TAU * f0 * (1 + 0.6 * Math.exp(-t * 60))) / SR;
    out[i] = Math.sin(ph) * Math.exp(-t * 70);
  }
  return out;
}

// ---------------------------------------------------------------- composer

function render(r: Recipe) {
  const rand = rng(r.seed);
  const beat = 60 / r.bpm;
  const bar = beat * 4;
  const step = beat / 4;
  const bars = Math.max(8, Math.round(r.seconds / bar));
  const total = bars * bar + 3;
  const bus = new Bus(sec(total));
  const swing = r.style === 'lofi' || r.style === 'chillhop' ? 0.18 : 0;
  const at = (barIdx: number, s16: number) => barIdx * bar + s16 * step + (s16 % 2 === 1 ? swing * step : 0);

  const note = (degree: number, octave = 0) => {
    const len = r.scale.length;
    const o = Math.floor(degree / len);
    const d = ((degree % len) + len) % len;
    return r.root + r.scale[d] + 12 * (o + octave);
  };
  const chordOf = (deg: number, sevenths: boolean) => [0, 2, 4, ...(sevenths ? [6] : [])].map(x => note(deg + x, -1));

  // Song form, in fractions of the track.
  const section = (b: number) => {
    const f = b / bars;
    if (f < 0.125) return 'intro';
    if (f < 0.44) return 'verse';
    if (f < 0.75) return 'chorus';
    if (f < 0.85) return 'break';
    return 'outro';
  };

  // A 4-bar melodic phrase in 16th steps: [step, degree, lengthInSteps].
  const densities: Record<Style, number> = { lofi: 0.34, chillhop: 0.42, synthwave: 0.5, pop: 0.5, fusion: 0.45, folk: 0.5 };
  const makeMotif = () => {
    const out: [number, number, number][] = [];
    let deg = 7 + Math.floor(rand() * 3);
    for (let s = 0; s < 32; s++) {
      const strong = s % 4 === 0;
      if (rand() < densities[r.style] * (strong ? 1.6 : 0.8)) {
        deg += Math.round((rand() - 0.5) * 4);
        deg = Math.min(13, Math.max(5, deg));
        const len = 1 + Math.floor(rand() * (strong ? 4 : 2));
        out.push([s, deg, len]);
        s += len - 1;
      }
    }
    return out;
  };
  const motifA = makeMotif();
  const motifB = makeMotif();
  const phrase = [...motifA, ...motifA.map(([s, d, l]) => [s + 32, s > 24 ? d + 2 : d, l] as [number, number, number]), ...motifB.map(([s, d, l]) => [s + 64, d, l] as [number, number, number]), ...motifA.map(([s, d, l]) => [s + 96, s > 24 ? d - 1 : d, l] as [number, number, number])];

  const kickPat: Record<Style, number[]> = { lofi: [0, 7, 10], chillhop: [0, 3, 8, 10], synthwave: [0, 4, 8, 12], pop: [0, 6, 8], fusion: [0, 10], folk: [0, 6, 8, 14] };
  const snarePat: Record<Style, number[]> = { lofi: [4, 12], chillhop: [4, 12], synthwave: [4, 12], pop: [4, 12], fusion: [], folk: [4, 12] };
  // Teentaal-inspired 16-step pattern: B = bayan+dayan (dha/dhin), D = dayan only (tin/ta).
  const tabla = 'B.dDB.dDB.dDb.dD';

  const kickSig = kick(r.style === 'synthwave' ? 1.2 : 1);
  const snareSig = snare(rand);
  const clapSig = clap(rand);
  const bayanSig = bayan();

  for (let b = 0; b < bars; b++) {
    const sec_ = section(b);
    const deg = r.progression[b % r.progression.length];
    const chord = chordOf(deg, r.style === 'lofi' || r.style === 'chillhop');
    const drums = sec_ === 'verse' || sec_ === 'chorus';
    const full = sec_ === 'chorus';

    // Harmony
    if (r.style === 'lofi' || r.style === 'chillhop') {
      for (const [i, m] of chord.entries()) bus.add(at(b, 0) + i * 0.012, epiano(mtof(m + 12), bar * 0.95), 0.11, (i - 1.5) * 0.25, 0.35);
      if (r.style === 'chillhop' && sec_ !== 'intro') for (const [i, m] of chord.entries()) bus.add(at(b, 10) + i * 0.01, epiano(mtof(m + 12), step * 5), 0.07, (i - 1.5) * 0.3, 0.3);
    } else if (r.style === 'pop') {
      for (const m of chord) bus.add(at(b, 0), pad(mtof(m + 12), bar, 1800), 0.05, 0, 0.4);
      if (sec_ !== 'intro' && sec_ !== 'outro') {
        for (const s of [0, 3, 6, 8, 11, 14]) chord.forEach((m, i) => bus.add(at(b, s) + i * 0.014, pluck(mtof(m + 12), step * 3, rand, 0.55, 0.994), 0.12, -0.3 + i * 0.2, 0.25));
      }
    } else if (r.style === 'synthwave') {
      for (const m of chord) bus.add(at(b, 0), pad(mtof(m + 12), bar, sec_ === 'chorus' ? 2600 : 1500), 0.07, 0, 0.5);
      if (sec_ !== 'intro') for (let s = 0; s < 16; s++) bus.add(at(b, s), envelope(lowpass(osc(TABLES.square, mtof(chord[s % chord.length] + 24), sec(step * 0.9)), 3500), 0.003, 0.05, 0.4, 0.05), 0.045, s % 2 ? 0.45 : -0.45, 0.45);
    } else {
      // fusion / folk: tanpura drone (Pa Sa Sa Sa) plus a soft pad
      const sa = r.root - 12, pa = r.root - 5;
      [pa, sa + 12, sa + 12, sa].forEach((m, i) => bus.add(b * bar + i * beat, pluck(mtof(m), beat * 2.6, rand, 0.85, 0.9993), 0.13, i % 2 ? 0.3 : -0.3, 0.5));
      bus.add(at(b, 0), pad(mtof(r.root + (deg ? r.scale[deg % 7] : 0)), bar, 900), 0.06, 0, 0.5);
    }

    // Bass
    if (sec_ !== 'intro') {
      const root = chord[0] - 12;
      if (r.style === 'synthwave') for (let s = 0; s < 16; s += 2) bus.add(at(b, s), bass(mtof(root + (s % 4 === 2 ? 12 : 0)), step * 1.8, TABLES.warm, 900), 0.33, 0, 0.05);
      else if (r.style === 'fusion' || r.style === 'folk') { bus.add(at(b, 0), bass(mtof(r.root - 24), beat * 1.8), 0.32, 0, 0.05); bus.add(at(b, 8), bass(mtof(r.root - 24), beat * 1.5), 0.26, 0, 0.05); }
      else for (const [s, l] of r.style === 'pop' ? [[0, 5], [6, 2], [8, 6]] : [[0, 6], [10, 4]]) bus.add(at(b, s), bass(mtof(root), step * l), 0.36, 0, 0.04);
    }

    // Drums
    if (drums || (r.style === 'fusion' && sec_ !== 'intro')) {
      for (const s of kickPat[r.style]) bus.add(at(b, s), kickSig, r.style === 'fusion' ? 0.32 : 0.55, 0, 0.03);
      for (const s of snarePat[r.style]) bus.add(at(b, s), r.style === 'pop' || r.style === 'synthwave' ? clapSig : snareSig, r.style === 'lofi' ? 0.22 : 0.3, 0, r.style === 'synthwave' ? 0.6 : 0.2);
      const hatStep = r.style === 'synthwave' || (full && r.style === 'pop') ? 1 : 2;
      for (let s = 0; s < 16; s += hatStep) {
        if (r.style === 'fusion') break;
        const sig = r.style === 'folk' ? shaker(rand) : hat(rand, r.style === 'synthwave' && s % 4 === 2);
        bus.add(at(b, s), sig, (s % 4 === 0 ? 0.12 : 0.07) * (r.style === 'folk' ? 1.6 : 1), 0.35, 0.1);
      }
    }
    if ((r.style === 'fusion' || r.style === 'folk') && sec_ !== 'intro' && sec_ !== 'outro') {
      for (let s = 0; s < 16; s++) {
        const bol = tabla[s];
        if (bol === '.') continue;
        if (bol === 'B') bus.add(at(b, s), bayanSig, 0.3, -0.15, 0.15);
        if (bol === 'B' || bol === 'D' || bol === 'd' || bol === 'b') bus.add(at(b, s), dayan(mtof(r.root + 12), bol === 'd' ? 16 : 9), bol === 'd' ? 0.1 : 0.16, 0.2, 0.2);
      }
    }

    // Melody
    if (sec_ === 'verse' || sec_ === 'chorus' || (sec_ === 'break' && r.style !== 'synthwave')) {
      const offset = (b % 4) * 16;
      for (const [s, d, l] of phrase) {
        if (s < offset || s >= offset + 16) continue;
        const m = note(d, full ? 0 : -1);
        const t = at(b, s - offset);
        const dur = l * step;
        if (r.style === 'synthwave') bus.add(t, envelope(lowpass(osc(TABLES.warm, mtof(m), sec(dur + 0.1)), 2400), 0.01, 0.1, 0.7, 0.12), 0.11, 0, 0.55);
        else if (r.style === 'lofi' || r.style === 'chillhop') bus.add(t, pluck(mtof(m), dur + 0.4, rand, 0.4, 0.995), 0.2, 0.15, 0.4);
        else if (r.style === 'pop') bus.add(t, envelope(osc(TABLES.organ, mtof(m), sec(dur + 0.05)), 0.01, 0.1, 0.6, 0.1), 0.08, 0.1, 0.45);
        else bus.add(t, pluck(mtof(m), dur + 0.6, rand, 0.9, 0.998), 0.22, 0.2, 0.45);
        if (full && r.style !== 'synthwave') bus.add(t + 0.01, pluck(mtof(m + 12), dur + 0.3, rand, 0.7, 0.995), 0.06, -0.3, 0.5);
      }
    }
  }

  // Ambience: rain bed with drops, or vinyl crackle for lo-fi.
  if (r.rain || r.style === 'lofi') {
    const n = bus.length;
    if (r.rain) {
      const bed = new Float32Array(n);
      for (let i = 0; i < n; i++) bed[i] = rand() * 2 - 1;
      lowpass(highpass(bed, 500), 3500);
      for (let i = 0; i < n; i++) bed[i] *= 0.55 + 0.25 * Math.sin((TAU * i) / (SR * 7.3));
      bus.add(0, bed, 0.05, -0.2, 0.15);
      bus.add(0.013, bed, 0.04, 0.3, 0);
      for (let t = 0; t < total; t += 0.02 + rand() * 0.12) bus.add(t, droplet(rand), 0.012 + rand() * 0.02, rand() * 2 - 1, 0.3);
    }
    if (r.style === 'lofi') {
      for (let t = 0; t < total; t += 0.03 + rand() * 0.25) {
        const click = new Float32Array(sec(0.002));
        for (let i = 0; i < click.length; i++) click[i] = (rand() * 2 - 1) * (1 - i / click.length);
        bus.add(t, click, 0.03 + rand() * 0.05, rand() - 0.5, 0);
      }
    }
  }

  // Master: reverb, soft clip, fades, normalise.
  const wetL = reverb(bus.sL, 0), wetR = reverb(bus.sR, 23);
  const L = new Float32Array(bus.length), R = new Float32Array(bus.length);
  const fadeIn = sec(1.2), fadeOut = sec(4);
  for (let i = 0; i < bus.length; i++) {
    let gain = 1;
    if (i < fadeIn) gain = i / fadeIn;
    if (i > bus.length - fadeOut) gain = (bus.length - i) / fadeOut;
    L[i] = Math.tanh((bus.L[i] + wetL[i] * 0.18) * 1.4) * gain;
    R[i] = Math.tanh((bus.R[i] + wetR[i] * 0.18) * 1.4) * gain;
  }
  let peak = 0;
  for (let i = 0; i < bus.length; i++) peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
  const norm = 0.89 / (peak || 1);
  return { L: L.map(v => v * norm), R: R.map(v => v * norm), seconds: bus.length / SR };
}

async function encode(L: Float32Array, R: Float32Array) {
  // Dynamic import picks the package's ESM build (its CJS build has no named export).
  const { Mp3Encoder } = await import('@breezystack/lamejs');
  const toInt = (f: Float32Array) => Int16Array.from(f, v => Math.max(-32768, Math.min(32767, Math.round(v * 32767))));
  const l = toInt(L), r = toInt(R);
  const enc = new Mp3Encoder(2, SR, 128);
  const chunks: Uint8Array[] = [];
  for (let i = 0; i < l.length; i += 1152) {
    const out = enc.encodeBuffer(l.subarray(i, i + 1152), r.subarray(i, i + 1152));
    if (out.length) chunks.push(new Uint8Array(out));
  }
  const tail = enc.flush();
  if (tail.length) chunks.push(new Uint8Array(tail));
  return Buffer.concat(chunks);
}

async function main() {
  const outDir = path.resolve('public/audio/originals');
  await mkdir(outDir, { recursive: true });
  const durations: Record<string, number> = {};
  const only = process.argv[2];
  for (const recipe of RECIPES) {
    if (only && recipe.id !== only) continue;
    const started = Date.now();
    const { L, R, seconds } = render(recipe);
    const mp3 = await encode(L, R);
    await writeFile(path.join(outDir, `${recipe.id}.mp3`), mp3);
    durations[recipe.id] = Math.round(seconds * 10) / 10;
    console.log(`${recipe.id}.mp3  ${seconds.toFixed(1)}s  ${(mp3.length / 1024).toFixed(0)} KB  (${Date.now() - started} ms)`);
  }
  if (!only) await writeFile(path.resolve('data/originals-audio.json'), JSON.stringify(durations, null, 2) + '\n');
}

main().catch(err => { console.error(err); process.exitCode = 1; });
