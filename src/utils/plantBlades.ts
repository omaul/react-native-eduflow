/**
 * Leaf geometry.
 *
 * A blade is described by a width profile — half-width as a fraction of the widest point,
 * sampled from base (t=0) to tip (t=1). Outlines, veins and variegation all read the same
 * profile, so markings land inside the blade whatever its shape. That is what separates a
 * species portrait from a silhouette: the slits of a monstera, the silver blotches of a
 * scindapsus and the pale stripes of a calathea are the features people recognise.
 *
 * All geometry is authored with **+y pointing up**: base at (0, 0), tip at (0, length).
 * The renderer flips the axis once.
 */

import { Blade, Veins, Variegation } from '../types/plantModel';

export type Random = (min?: number, max?: number) => number;

function round(value: number): number {
  return Math.round(value * 10) / 10;
}

// ===== Width profiles =====

/** Half-width at t, as a fraction of the blade's widest half-width */
export function bladeWidthAt(blade: Blade, t: number): number {
  const u = Math.min(Math.max(t, 0), 1);
  switch (blade) {
    case 'cordate':
      // Wide at the base, so the two basal lobes survive the notch; widest at ~0.32
      return Math.sin(Math.PI * (0.26 + 0.74 * u)) ** 0.7;
    case 'sagittate':
      return Math.sin(Math.PI * (0.22 + 0.78 * u)) ** 0.8;
    case 'orbicular':
    case 'peltate':
      return Math.sqrt(Math.max(0, 1 - (2 * u - 1) ** 2));
    case 'linear':
      // Rises fast, holds near full width, tapers only at the tip
      return Math.min(1, u / 0.1) * (1 - u ** 3) ** 0.4;
    case 'lanceolate':
      return Math.min(1, u / 0.06) * (1 - u) ** 0.62;
    case 'fenestrate':
    case 'elliptic':
    default:
      return Math.sin(Math.PI * u) ** 0.62;
  }
}

/** Width-to-length ratio used when a leaf does not override it */
export function bladeDefaultRatio(blade: Blade): number {
  switch (blade) {
    case 'cordate':
      return 0.78;
    case 'sagittate':
      return 0.56;
    case 'orbicular':
    case 'peltate':
      return 1;
    case 'wing':
      return 0.62;
    case 'linear':
      return 0.13;
    case 'lanceolate':
      return 0.2;
    case 'fenestrate':
      return 0.82;
    case 'elliptic':
    default:
      return 0.52;
  }
}

/** How far below the attachment point the outline closes — the notch of a heart leaf */
function basalNotch(blade: Blade): number {
  switch (blade) {
    case 'cordate':
      return 0.17;
    case 'sagittate':
      return 0.3;
    default:
      return 0;
  }
}

/**
 * Slit positions for a fenestrated blade. Sides alternate so the blade keeps a continuous
 * body — symmetric cuts at the same height read as stripes rather than windows.
 */
function fenestrations(): { center: number; side: number }[] {
  return [0.22, 0.37, 0.52, 0.66, 0.79].map((center, index) => ({
    center,
    side: index % 2 === 0 ? 1 : -1,
  }));
}

// ===== Outline =====

const SAMPLES = 44;

function edgeAt(blade: Blade, t: number, side: number, halfWidth: number): number {
  let w = bladeWidthAt(blade, t);
  if (blade === 'fenestrate') {
    const cut = fenestrations().some(
      (slit) => slit.side === side && Math.abs(t - slit.center) < 0.035
    );
    if (cut) w *= 0.2;
  }
  // A begonia leaf is lopsided: one half is broader and starts lower than the other
  if (blade === 'wing') {
    w = side > 0 ? w : Math.sin(Math.PI * (0.12 + 0.88 * t)) ** 0.8 * 0.6;
  }
  return w * halfWidth;
}

/**
 * How far the blade sits below the point the stalk reaches. A peltate leaf is held up in the
 * middle like a parasol, so its blade straddles the attachment instead of rising from it. The
 * renderer applies this as a transform, which keeps the outline, veins and markings in one
 * coordinate space — offsetting only the outline would leave the markings behind.
 */
export function bladeOffset(blade: Blade, length: number): number {
  return blade === 'peltate' ? -length / 2 : 0;
}

/**
 * Lateral offset of the blade's midline at t, for a blade whose tip bends sideways by `curve`.
 * Quadratic, so the base leaves the stalk straight and the bend builds towards the tip.
 */
function bendAt(curve: number, t: number): number {
  return curve * t * t;
}

/** Closed outline of a blade of the given length and half-width */
export function bladeOutline(
  blade: Blade,
  length: number,
  halfWidth: number,
  curve = 0
): string {
  if (blade === 'sagittate') return sagittateOutline(length, halfWidth);

  const notch = basalNotch(blade) * length;
  const right: [number, number][] = [];
  const left: [number, number][] = [];

  for (let i = 0; i <= SAMPLES; i++) {
    const t = i / SAMPLES;
    const y = length * t;
    const bend = bendAt(curve, t);
    right.push([bend + edgeAt(blade, t, 1, halfWidth), y]);
    left.push([bend - edgeAt(blade, t, -1, halfWidth), y]);
  }

  const points = [...right, ...left.reverse()];
  const head = basalNotch(blade) > 0 ? [[0, notch] as [number, number], ...points] : points;

  return (
    head.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${round(x)} ${round(y)}`).join(' ') + ' Z'
  );
}

/** Arrow blade: the two lobes point back past the attachment point, which no profile can express */
function sagittateOutline(length: number, halfWidth: number): string {
  const w = round(halfWidth);
  const l = length;
  return [
    `M0 ${round(l)}`,
    `C${-w} ${round(l * 0.42)} ${-w} ${round(l * 0.16)} ${round(-w * 0.82)} 0`,
    `L${round(-w * 0.14)} ${round(l * 0.2)}`,
    `L${round(w * 0.14)} ${round(l * 0.2)}`,
    `L${round(w * 0.82)} 0`,
    `C${w} ${round(l * 0.16)} ${w} ${round(l * 0.42)} 0 ${round(l)}`,
    'Z',
  ].join(' ');
}

// ===== Veins =====

/** Vein paths for a blade. Stroked, not filled. */
export function veinPaths(
  blade: Blade,
  veins: Veins,
  length: number,
  halfWidth: number,
  curve = 0
): string[] {
  if (veins === 'none') return [];

  // The midrib follows the bend, so a curved blade does not get a straight rib through it
  const midrib = `M0 ${round(length * 0.02)} Q${round(bendAt(curve, 0.5) * 0.9)} ${round(length * 0.5)} ${round(bendAt(curve, 0.94))} ${round(length * 0.94)}`;
  if (veins === 'midrib') return [midrib];

  const paths = [midrib];

  if (veins === 'pinnate') {
    const pairs = 5;
    for (let i = 1; i <= pairs; i++) {
      const t = 0.14 + (i - 1) * (0.66 / (pairs - 1));
      const outer = Math.min(t + 0.16, 0.93);
      for (const side of [-1, 1]) {
        // Per-side width: on an asymmetric blade the halves differ, and a vein drawn to the
        // wrong half's edge sticks out past the outline as a stray hair
        const x = edgeAt(blade, outer, side, halfWidth) * 0.82;
        const from = bendAt(curve, t);
        const to = bendAt(curve, outer);
        paths.push(
          `M${round(from)} ${round(length * t)} Q${round(from + side * x * 0.55)} ${round(length * (t + 0.05))} ${round(to + side * x)} ${round(length * outer)}`
        );
      }
    }
    return paths;
  }

  if (veins === 'palmate') {
    const ribs = 4;
    for (let i = 1; i <= ribs; i++) {
      const outer = 0.32 + (i - 1) * (0.56 / (ribs - 1));
      for (const side of [-1, 1]) {
        const x = edgeAt(blade, outer, side, halfWidth) * 0.8;
        paths.push(
          `M0 ${round(length * 0.06)} Q${round(side * x * 0.5)} ${round(length * outer * 0.5)} ${round(side * x)} ${round(length * outer)}`
        );
      }
    }
    return paths;
  }

  // parallel — long curves that run base to tip alongside the midrib
  const lines = 3;
  for (let i = 1; i <= lines; i++) {
    const share = i / (lines + 1);
    for (const side of [-1, 1]) {
      const mid = edgeAt(blade, 0.5, side, halfWidth) * share * 0.9;
      paths.push(
        `M0 ${round(length * 0.05)} Q${round(bendAt(curve, 0.5) + side * mid * 1.15)} ${round(length * 0.5)} ${round(bendAt(curve, 0.95))} ${round(length * 0.95)}`
      );
    }
  }
  return paths;
}

// ===== Variegation =====

export interface Mark {
  d: string;
  /** Marks are clipped to the blade, so they may overrun the outline */
  opacity?: number;
  /** The path is a ring made of two subpaths — fill the gap between them, not the whole shape */
  evenOdd?: boolean;
}

/**
 * Pale markings on the blade. Clipped to the outline by the renderer, so shapes may
 * overrun the edge — that is what gives blotches their bitten-off look.
 */
export function variegationMarks(
  variegation: Variegation,
  blade: Blade,
  length: number,
  halfWidth: number,
  random: Random,
  curve = 0
): Mark[] {
  switch (variegation) {
    case 'silver-blotch':
      return silverBlotches(blade, length, halfWidth, random);
    case 'stripe':
      return stripes(blade, length, halfWidth);
    case 'spot':
      return spots(blade, length, halfWidth, random);
    case 'margin':
      return marginBand(blade, length, halfWidth, curve);
    case 'midstripe':
      return midStripe(blade, length, halfWidth, curve);
    case 'band':
      return crossBands(blade, length, halfWidth, random, curve);
    // Pale veins are drawn by the vein pass, not as a separate mark
    case 'light-veins':
    case 'none':
    default:
      return [];
  }
}

/** A pale rim following the edge — dracaena marginata */
function marginBand(blade: Blade, length: number, halfWidth: number, curve: number): Mark[] {
  return [
    {
      d: `${bladeOutline(blade, length, halfWidth, curve)} ${bladeOutline(blade, length * 0.9, halfWidth * 0.66, curve * 0.9)}`,
      evenOdd: true,
    },
  ];
}

/** A pale band down the middle — chlorophytum */
function midStripe(blade: Blade, length: number, halfWidth: number, curve: number): Mark[] {
  const share = 0.36;
  const points: [number, number][] = [];
  const back: [number, number][] = [];

  for (let i = 0; i <= 20; i++) {
    const t = 0.03 + (i / 20) * 0.92;
    const x = edgeAt(blade, t, 1, halfWidth) * share;
    const bend = bendAt(curve, t);
    points.push([bend + x, length * t]);
    back.push([bend - x, length * t]);
  }

  return [
    {
      d:
        [...points, ...back.reverse()]
          .map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${round(x)} ${round(y)}`)
          .join(' ') + ' Z',
    },
  ];
}

/** Irregular chevron banding across the blade — sansevieria */
function crossBands(
  blade: Blade,
  length: number,
  halfWidth: number,
  random: Random,
  curve: number
): Mark[] {
  const marks: Mark[] = [];
  const count = 9;

  for (let i = 0; i < count; i++) {
    const t = 0.06 + (i / count) * 0.86 + random(-0.015, 0.015);
    const edge = edgeAt(blade, t, 1, halfWidth) * 0.96;
    const y = length * t;
    const bend = bendAt(curve, t);
    const thick = length * random(0.014, 0.026);
    const rise = length * random(0.01, 0.03);

    marks.push({
      d: [
        `M${round(bend - edge)} ${round(y)}`,
        `Q${round(bend)} ${round(y + rise)} ${round(bend + edge)} ${round(y)}`,
        `L${round(bend + edge)} ${round(y + thick)}`,
        `Q${round(bend)} ${round(y + rise + thick)} ${round(bend - edge)} ${round(y + thick)}`,
        'Z',
      ].join(' '),
      opacity: random(0.6, 0.95),
    });
  }
  return marks;
}

/** Irregular patches sitting between the veins — scindapsus pictus */
function silverBlotches(
  blade: Blade,
  length: number,
  halfWidth: number,
  random: Random
): Mark[] {
  const marks: Mark[] = [];
  const count = 7;

  for (let i = 0; i < count; i++) {
    const t = 0.15 + (i / count) * 0.7 + random(-0.04, 0.04);
    const side = i % 2 === 0 ? 1 : -1;
    const room = edgeAt(blade, t, side, halfWidth);
    if (room < halfWidth * 0.2) continue;

    // Biased towards the margin: the patches sit between the veins, not over the midrib
    const cx = side * room * random(0.44, 0.84);
    const cy = length * t;
    const rx = room * random(0.26, 0.44);
    const ry = length * random(0.05, 0.09);

    // Four arcs with jittered radii — a lumpy blob rather than a clean ellipse
    marks.push({
      d: [
        `M${round(cx - rx)} ${round(cy)}`,
        `Q${round(cx - rx * random(0.5, 0.9))} ${round(cy + ry * random(1, 1.5))} ${round(cx)} ${round(cy + ry)}`,
        `Q${round(cx + rx * random(0.6, 1.1))} ${round(cy + ry * random(0.7, 1.2))} ${round(cx + rx)} ${round(cy)}`,
        `Q${round(cx + rx * random(0.5, 0.9))} ${round(cy - ry * random(0.8, 1.3))} ${round(cx)} ${round(cy - ry)}`,
        `Q${round(cx - rx * random(0.6, 1.1))} ${round(cy - ry * random(0.7, 1.2))} ${round(cx - rx)} ${round(cy)}`,
        'Z',
      ].join(' '),
      opacity: random(0.75, 1),
    });
  }
  return marks;
}

/** Pale bands radiating from the midrib along the lateral veins — calathea */
function stripes(blade: Blade, length: number, halfWidth: number): Mark[] {
  const marks: Mark[] = [];
  const pairs = 5;

  for (let i = 1; i <= pairs; i++) {
    const t = 0.12 + (i - 1) * (0.64 / (pairs - 1));
    const outer = Math.min(t + 0.18, 0.94);
    const x = edgeAt(blade, outer, 1, halfWidth) * 0.94;
    const thick = length * 0.038;

    for (const side of [-1, 1]) {
      marks.push({
        d: [
          `M0 ${round(length * t - thick)}`,
          `Q${round(side * x * 0.55)} ${round(length * (t + 0.03))} ${round(side * x)} ${round(length * outer - thick * 0.4)}`,
          `L${round(side * x)} ${round(length * outer + thick * 0.4)}`,
          `Q${round(side * x * 0.5)} ${round(length * (t + 0.07))} 0 ${round(length * t + thick)}`,
          'Z',
        ].join(' '),
      });
    }
  }
  return marks;
}

/** Scattered dots — begonia maculata */
function spots(blade: Blade, length: number, halfWidth: number, random: Random): Mark[] {
  const marks: Mark[] = [];
  const count = 14;

  for (let i = 0; i < count; i++) {
    const t = 0.12 + random(0, 0.78);
    const side = i % 2 === 0 ? 1 : -1;
    const room = edgeAt(blade, t, side, halfWidth);
    if (room < halfWidth * 0.15) continue;

    const cx = side * room * random(0.2, 0.82);
    const cy = length * t;
    const r = Math.max(0.8, halfWidth * random(0.05, 0.09));
    marks.push({
      d: `M${round(cx - r)} ${round(cy)} a${round(r)} ${round(r)} 0 1 0 ${round(r * 2)} 0 a${round(r)} ${round(r)} 0 1 0 ${round(-r * 2)} 0 Z`,
    });
  }
  return marks;
}
