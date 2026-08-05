/**
 * Procedural plant portraits.
 *
 * Instead of photographs the library draws each plant from three traits — growth form,
 * leaf shape and palette. The result is deterministic per plant id, needs no assets and
 * carries information: a reader can see that peperomia is a low clump of round leaves
 * while monstera is a clump of large fenestrated ones.
 *
 * Pure geometry only — no React, no p5. The renderer turns this into SVG.
 */

import { PlantPalette, PlantVisual, LeafShape } from '../types/catalog';

export const PORTRAIT_SIZE = 120;
const BASE_X = PORTRAIT_SIZE / 2;
const BASE_Y = PORTRAIT_SIZE - 8;

export interface PortraitElement {
  kind: 'stem' | 'leaf' | 'body';
  /** SVG path in local coordinates: grows upward from (0,0) */
  d: string;
  /** Places the element on the canvas */
  transform: string;
  /** Shade index within the palette */
  tone: 0 | 1 | 2;
  /** Degrees of gentle sway when animated */
  sway: number;
  /** Animation offset in seconds, so elements do not move in unison */
  delay: number;
}

export interface Portrait {
  size: number;
  palette: PlantPalette;
  elements: PortraitElement[];
}

// ===== Deterministic randomness =====

function hashSeed(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function makeRandom(seed: string) {
  let state = hashSeed(seed) || 1;
  return (min = 0, max = 1) => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    state >>>= 0;
    return min + (state / 4294967296) * (max - min);
  };
}

type Random = ReturnType<typeof makeRandom>;

function round(value: number): number {
  return Math.round(value * 10) / 10;
}

function place(x: number, y: number, angle: number): string {
  return `translate(${round(x)} ${round(y)}) rotate(${round(angle)})`;
}

// ===== Leaf outlines (local coords, tip at -length) =====

function ovalLeaf(length: number, width: number): string {
  const w = round(width);
  const l = round(length);
  return `M0 0 C${-w} ${round(-l * 0.35)} ${round(-w * 0.7)} ${round(-l * 0.85)} 0 ${-l} C${round(w * 0.7)} ${round(-l * 0.85)} ${w} ${round(-l * 0.35)} 0 0 Z`;
}

function heartLeaf(length: number, width: number): string {
  const w = round(width);
  const l = round(length);
  const notch = round(-l * 0.12);
  return `M0 ${notch} C${-w} ${round(-l * 0.05)} ${round(-w * 1.05)} ${round(-l * 0.7)} 0 ${-l} C${round(w * 1.05)} ${round(-l * 0.7)} ${w} ${round(-l * 0.05)} 0 ${notch} Z`;
}

function roundLeaf(length: number): string {
  // The circle sits directly on the attachment point, otherwise it floats off the petiole
  const r = round(length * 0.38);
  const cy = -r;
  return `M0 ${round(cy - r)} A${r} ${r} 0 1 1 -0.1 ${round(cy - r)} Z`;
}

function strapLeaf(length: number, width: number): string {
  const w = round(width);
  const l = round(length);
  return `M0 0 C${-w} ${round(-l * 0.45)} ${round(-w * 0.5)} ${round(-l * 0.85)} 0 ${-l} C${round(w * 0.5)} ${round(-l * 0.85)} ${w} ${round(-l * 0.45)} 0 0 Z`;
}

function spikeLeaf(length: number, width: number): string {
  const w = round(width);
  const l = round(length);
  return `M0 0 C${-w} ${round(-l * 0.5)} ${round(-w * 0.35)} ${round(-l * 0.92)} 0 ${-l} C${round(w * 0.35)} ${round(-l * 0.92)} ${w} ${round(-l * 0.5)} 0 0 Z`;
}

/** Sagittate leaf: broad with two lobes pointing back towards the petiole */
function arrowLeaf(length: number, width: number): string {
  const w = round(width);
  const l = round(length);
  return [
    `M0 ${-l}`,
    `C${-w} ${round(-l * 0.62)} ${-w} ${round(-l * 0.28)} ${round(-w * 0.8)} 0`,
    `L${round(-w * 0.16)} ${round(-l * 0.22)}`,
    `L${round(w * 0.16)} ${round(-l * 0.22)}`,
    `L${round(w * 0.8)} 0`,
    `C${w} ${round(-l * 0.28)} ${w} ${round(-l * 0.62)} 0 ${-l}`,
    'Z',
  ].join(' ');
}

/**
 * Fenestrated leaf. The outline stays smooth except at a few narrow bands where it is
 * pulled almost to the midrib, which reads as the slits of a monstera leaf. Wide notches
 * turn the whole shape into a feather, so the windows are kept deliberately narrow.
 */
function splitLeaf(length: number, width: number, random: Random): string {
  const samples = 48;
  const halfWidth = 0.035;
  // Slits alternate between the sides, so the blade keeps a continuous body instead of
  // looking banded — symmetric cuts at the same height read as stripes, not windows.
  const notches = [0.2, 0.36, 0.52, 0.68, 0.82].map((center, index) => ({
    center: center + random(-0.02, 0.02),
    side: index % 2 === 0 ? 1 : -1,
  }));

  function edge(t: number, side: number): number {
    const profile = Math.sin(Math.PI * Math.min(t + 0.05, 1)) ** 0.7;
    const cut = notches.some(
      (notch) => notch.side === side && Math.abs(t - notch.center) < halfWidth
    );
    return width * profile * (cut ? 0.22 : 1);
  }

  const right: [number, number][] = [];
  const left: [number, number][] = [];
  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    const y = -length * t;
    right.push([edge(t, 1), y]);
    left.push([-edge(t, -1), y]);
  }

  return (
    [...right, ...left.reverse()]
      .map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${round(x)} ${round(y)}`)
      .join(' ') + ' Z'
  );
}

function leafPath(shape: LeafShape, length: number, random: Random): string {
  switch (shape) {
    case 'heart':
      return heartLeaf(length, length * 0.42);
    case 'split': {
      // Fenestrated leaves are the largest thing a houseplant grows — draw them so
      const scaled = length * 1.35;
      return splitLeaf(scaled, scaled * 0.4, random);
    }
    case 'arrow':
      return arrowLeaf(length, length * 0.27);
    case 'round':
      return roundLeaf(length);
    case 'strap':
      return strapLeaf(length, length * 0.11);
    case 'spike':
      return spikeLeaf(length, length * 0.15);
    case 'frond':
    case 'oval':
    default:
      return ovalLeaf(length, length * 0.3);
  }
}

/** Curved petiole from the base to (x, y) */
function stemPath(dx: number, dy: number, bend: number): string {
  return `M0 0 Q${round(dx * 0.35 + bend)} ${round(dy * 0.55)} ${round(dx)} ${round(dy)}`;
}

// ===== Growth forms =====

function tone(index: number): 0 | 1 | 2 {
  return (index % 3) as 0 | 1 | 2;
}

function uprightForm(visual: PlantVisual, random: Random): PortraitElement[] {
  const count = Math.round(random(5, 8));
  const elements: PortraitElement[] = [];
  for (let i = 0; i < count; i++) {
    const spread = count === 1 ? 0 : (i / (count - 1) - 0.5) * 2;
    const angle = spread * random(26, 40);
    const length = random(62, 96) * (1 - Math.abs(spread) * 0.22);
    elements.push({
      kind: 'leaf',
      d: leafPath(visual.leaf, length, random),
      transform: place(BASE_X + spread * random(2, 7), BASE_Y, angle),
      tone: tone(i),
      sway: random(0.6, 1.6),
      delay: i * 0.45,
    });
  }
  return elements;
}

function rosetteForm(visual: PlantVisual, random: Random): PortraitElement[] {
  const count = Math.round(random(8, 11));
  const elements: PortraitElement[] = [];
  for (let i = 0; i < count; i++) {
    const spread = count === 1 ? 0 : (i / (count - 1) - 0.5) * 2;
    const angle = spread * random(66, 86);
    const length = random(42, 68) * (1 - Math.abs(spread) * 0.15);
    elements.push({
      kind: 'leaf',
      d: leafPath(visual.leaf, length, random),
      transform: place(BASE_X + spread * random(1, 4), BASE_Y - random(0, 4), angle),
      tone: tone(i),
      sway: random(0.5, 1.4),
      delay: i * 0.35,
    });
  }
  return elements;
}

function clumpForm(visual: PlantVisual, random: Random): PortraitElement[] {
  const count = Math.round(random(3, 5));
  const elements: PortraitElement[] = [];
  for (let i = 0; i < count; i++) {
    const spread = count === 1 ? 0 : (i / (count - 1) - 0.5) * 2;
    const angle = spread * random(28, 50);
    const petiole = random(28, 48);
    const leafLength = random(30, 46);
    const radians = (angle * Math.PI) / 180;
    const tipX = BASE_X + Math.sin(radians) * petiole;
    const tipY = BASE_Y - Math.cos(radians) * petiole;

    elements.push({
      kind: 'stem',
      d: stemPath(Math.sin(radians) * petiole, -Math.cos(radians) * petiole, spread * 4),
      transform: place(BASE_X, BASE_Y, 0),
      tone: 1,
      sway: random(0.3, 0.8),
      delay: i * 0.5,
    });
    elements.push({
      kind: 'leaf',
      d: leafPath(visual.leaf, leafLength, random),
      transform: place(tipX, tipY, angle),
      tone: tone(i),
      sway: random(1, 2.4),
      delay: i * 0.5 + 0.2,
    });
  }
  return elements;
}

function vineForm(visual: PlantVisual, random: Random): PortraitElement[] {
  const elements: PortraitElement[] = [];
  const height = random(78, 94);
  const lean = random(-16, 16);

  elements.push({
    kind: 'stem',
    d: `M0 0 C${round(lean * 1.4)} ${round(-height * 0.4)} ${round(-lean)} ${round(-height * 0.7)} ${round(lean * 0.5)} ${round(-height)}`,
    transform: place(BASE_X, BASE_Y, 0),
    tone: 1,
    sway: 0.4,
    delay: 0,
  });

  const count = Math.round(random(5, 8));
  for (let i = 0; i < count; i++) {
    const t = (i + 1) / (count + 1);
    const side = i % 2 === 0 ? -1 : 1;
    const y = BASE_Y - height * t;
    const x = BASE_X + lean * (1 - Math.abs(t - 0.5) * 2) * 0.8;
    const length = random(26, 40) * (1 - t * 0.25);
    elements.push({
      kind: 'leaf',
      d: leafPath(visual.leaf, length, random),
      transform: place(x, y, side * random(52, 88)),
      tone: tone(i),
      sway: random(1.2, 2.8),
      delay: i * 0.4,
    });
  }
  return elements;
}

function treeForm(visual: PlantVisual, random: Random): PortraitElement[] {
  const elements: PortraitElement[] = [];
  const trunkHeight = random(46, 60);
  const trunkWidth = random(4.5, 6.5);

  elements.push({
    kind: 'stem',
    d: `M${-trunkWidth} 0 L${round(-trunkWidth * 0.5)} ${round(-trunkHeight)} L${round(trunkWidth * 0.5)} ${round(-trunkHeight)} L${trunkWidth} 0 Z`,
    transform: place(BASE_X, BASE_Y, 0),
    tone: 1,
    sway: 0.2,
    delay: 0,
  });

  const branches = Math.round(random(2, 4));
  for (let b = 0; b < branches; b++) {
    const spread = branches === 1 ? 0 : (b / (branches - 1) - 0.5) * 2;
    const angle = spread * random(30, 52);
    const radians = (angle * Math.PI) / 180;
    const armLength = random(16, 26);
    const originY = BASE_Y - trunkHeight;
    const tipX = BASE_X + Math.sin(radians) * armLength;
    const tipY = originY - Math.cos(radians) * armLength;

    elements.push({
      kind: 'stem',
      d: stemPath(Math.sin(radians) * armLength, -Math.cos(radians) * armLength, 0),
      transform: place(BASE_X, originY, 0),
      tone: 1,
      sway: random(0.3, 0.7),
      delay: b * 0.4,
    });

    const leaves = Math.round(random(2, 4));
    for (let i = 0; i < leaves; i++) {
      const leafAngle = angle + (i - (leaves - 1) / 2) * random(22, 34);
      elements.push({
        kind: 'leaf',
        d: leafPath(visual.leaf, random(18, 28), random),
        transform: place(tipX, tipY, leafAngle),
        tone: tone(b + i),
        sway: random(0.8, 2),
        delay: b * 0.4 + i * 0.25,
      });
    }
  }
  return elements;
}

function fernForm(_visual: PlantVisual, random: Random): PortraitElement[] {
  const elements: PortraitElement[] = [];
  const fronds = Math.round(random(3, 5));

  for (let f = 0; f < fronds; f++) {
    const spread = fronds === 1 ? 0 : (f / (fronds - 1) - 0.5) * 2;
    const angle = spread * random(30, 52);
    const length = random(56, 80) * (1 - Math.abs(spread) * 0.18);
    const bend = spread * random(8, 16);

    elements.push({
      kind: 'stem',
      d: `M0 0 Q${round(bend)} ${round(-length * 0.6)} ${round(bend * 1.6)} ${round(-length)}`,
      transform: place(BASE_X, BASE_Y, angle),
      tone: 1,
      sway: random(0.6, 1.2),
      delay: f * 0.5,
    });

    const pinnae = Math.round(random(6, 9));
    for (let i = 1; i <= pinnae; i++) {
      const t = i / (pinnae + 1);
      const along = -length * t;
      const offset = bend * t * t;
      const pinnaLength = random(9, 15) * (1 - t * 0.45);
      for (const side of [-1, 1]) {
        elements.push({
          kind: 'leaf',
          d: ovalLeaf(pinnaLength, pinnaLength * 0.42),
          transform: `${place(BASE_X, BASE_Y, angle)} translate(${round(offset)} ${round(along)}) rotate(${round(side * random(58, 78))})`,
          tone: tone(i),
          sway: random(0.4, 1),
          delay: f * 0.5 + i * 0.1,
        });
      }
    }
  }
  return elements;
}

function stoneForm(_visual: PlantVisual, random: Random): PortraitElement[] {
  const elements: PortraitElement[] = [];
  const bodies = Math.round(random(2, 3));

  for (let b = 0; b < bodies; b++) {
    const spread = bodies === 1 ? 0 : (b / (bodies - 1) - 0.5) * 2;
    const width = random(20, 27);
    const height = random(17, 23);
    const x = BASE_X + spread * random(20, 26);
    const y = BASE_Y - random(2, 8);

    elements.push({
      kind: 'body',
      d: `M${-width} 0 C${-width} ${round(-height * 1.5)} ${width} ${round(-height * 1.5)} ${width} 0 Z`,
      transform: place(x, y, 0),
      tone: tone(b),
      sway: 0,
      delay: 0,
    });
    // The slit between the paired leaves
    elements.push({
      kind: 'stem',
      d: `M${round(-width * 0.55)} ${round(-height * 0.72)} L${round(width * 0.55)} ${round(-height * 0.72)}`,
      transform: place(x, y, 0),
      tone: 1,
      sway: 0,
      delay: 0,
    });
  }
  return elements;
}

function trapForm(_visual: PlantVisual, random: Random): PortraitElement[] {
  const elements: PortraitElement[] = [];
  const traps = Math.round(random(3, 5));

  for (let t = 0; t < traps; t++) {
    const spread = traps === 1 ? 0 : (t / (traps - 1) - 0.5) * 2;
    const angle = spread * random(30, 50);
    const petiole = random(30, 46);
    const radians = (angle * Math.PI) / 180;
    const tipX = BASE_X + Math.sin(radians) * petiole;
    const tipY = BASE_Y - Math.cos(radians) * petiole;
    const size = random(13, 18);

    elements.push({
      kind: 'stem',
      d: stemPath(Math.sin(radians) * petiole, -Math.cos(radians) * petiole, spread * 3),
      transform: place(BASE_X, BASE_Y, 0),
      tone: 1,
      sway: random(0.3, 0.8),
      delay: t * 0.4,
    });

    // Two lobes with teeth along the inner edge
    for (const side of [-1, 1]) {
      const teeth = 5;
      const path = [`M0 0`, `C${round(side * size * 0.9)} ${round(-size * 0.3)} ${round(side * size * 0.8)} ${round(-size * 1.1)} 0 ${round(-size * 1.15)}`];
      for (let i = teeth; i >= 1; i--) {
        const ty = -size * 1.15 * (i / (teeth + 1));
        path.push(`L${round(side * size * 0.34)} ${round(ty + size * 0.06)}`);
        path.push(`L0 ${round(ty)}`);
      }
      path.push('Z');
      elements.push({
        kind: 'leaf',
        d: path.join(' '),
        transform: place(tipX, tipY, angle + side * 12),
        tone: tone(t),
        sway: random(0.8, 1.8),
        delay: t * 0.4 + 0.2,
      });
    }
  }
  return elements;
}

const FORMS = {
  upright: uprightForm,
  rosette: rosetteForm,
  clump: clumpForm,
  vine: vineForm,
  tree: treeForm,
  fern: fernForm,
  stone: stoneForm,
  trap: trapForm,
};

export function buildPortrait(visual: PlantVisual, seed: string): Portrait {
  const random = makeRandom(seed);
  const build = FORMS[visual.form] ?? clumpForm;
  return {
    size: PORTRAIT_SIZE,
    palette: visual.palette,
    elements: build(visual, random),
  };
}
