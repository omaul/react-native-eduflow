/**
 * Turns an authored PlantModel plus an age into flat SVG groups.
 *
 * Age drives everything: an organ younger than the current age does not exist yet, and one
 * that has just appeared is drawn small and still furled upright, opening out as it matures.
 * The viewBox is fixed to the model's mature bounds, so a young plant genuinely looks small
 * inside the frame instead of being rescaled to fill it.
 */

import { Blade, PlantModel, PlantOrgan, PotOrgan, Tone } from '../types/plantModel';
import {
  bladeDefaultRatio,
  bladeOffset,
  bladeOutline,
  Random,
  variegationMarks,
  veinPaths,
} from './plantBlades';

const PAD_TOP = 6;
const DEFAULT_MATURATION = 0.28;
/** A new organ starts at this share of its mature size rather than at nothing */
const MIN_SCALE = 0.16;

export type ShapeRole =
  | 'pot'
  | 'rim'
  | 'soil'
  | 'stem'
  | 'blade'
  | 'vein'
  /** Pale, prominent veins — the feature of anthurium crystallinum and alocasia */
  | 'veinBright'
  | 'mark'
  /** A white spathe, as on a spathiphyllum */
  | 'bloomPale'
  /** A warm-coloured spathe, as on an anthurium */
  | 'bloomWarm';

export interface Shape {
  role: ShapeRole;
  /** Path in the group's local coordinates */
  d: string;
  tone?: Tone;
  opacity?: number;
  /** Stroke width for stems and veins */
  width?: number;
  /** The path is a ring of two subpaths; fill only the gap between them */
  evenOdd?: boolean;
}

export interface RenderGroup {
  transform: string;
  /** Marks in this group are clipped to this outline */
  clip?: { id: string; d: string };
  shapes: Shape[];
}

export interface Render {
  viewBox: string;
  /** Flips the authored +y-up space into SVG's y-down space */
  flip: string;
  groups: RenderGroup[];
}

function round(value: number): number {
  return Math.round(value * 10) / 10;
}

function smoothstep(t: number): number {
  return t * t * (3 - 2 * t);
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
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

function makeRandom(seed: string): Random {
  let state = hashSeed(seed) || 1;
  return (min = 0, max = 1) => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    state >>>= 0;
    return min + (state / 4294967296) * (max - min);
  };
}

// ===== Growth =====

/** How much of the age axis it takes an organ to drift out to its full splay */
const SPLAY_SPAN = 0.6;

interface Growth {
  /** 0 when the organ has just appeared, 1 when mature */
  eased: number;
  /** Multiplier for blade and petiole dimensions */
  scale: number;
  /** 0..1 share of the organ's outward drift that has happened */
  settled: number;
}

function growth(organAge: number, age: number, maturation: number): Growth | null {
  if (age < organAge) return null;
  const eased = smoothstep(clamp01((age - organAge) / maturation));
  return {
    eased,
    scale: MIN_SCALE + (1 - MIN_SCALE) * eased,
    settled: smoothstep(clamp01((age - organAge) / SPLAY_SPAN)),
  };
}

/**
 * The angle an organ is drawn at: a new one emerges furled and upright, swings out to its
 * authored angle as it matures, then keeps drifting outward as the plant itself ages.
 */
function organAngle(angle: number, splay: number | undefined, grow: Growth): number {
  const opened = angle * (0.42 + 0.58 * grow.eased);
  if (!splay) return opened;
  return opened + Math.sign(angle || 1) * Math.abs(splay) * grow.settled;
}

// ===== Pot =====

function potShapes(pot: PotOrgan): RenderGroup {
  const w = pot.width / 2;
  const h = pot.height;
  const rim = h * 0.13;
  const shapes: Shape[] = [];

  // Substrate surface, first in the group so leaves rise out of it
  shapes.push({
    role: 'soil',
    d: `M${round(-w * 0.88)} ${round(rim * 0.5)} L${round(w * 0.88)} ${round(rim * 0.5)}`,
    width: 2,
  });

  if (pot.style === 'tapered') {
    const foot = w * 0.7;
    shapes.push({
      role: 'pot',
      d: `M${round(-w)} 0 L${round(-foot)} ${round(-h)} L${round(foot)} ${round(-h)} L${round(w)} 0 Z`,
    });
  } else if (pot.style === 'hanging') {
    const foot = w * 0.78;
    shapes.push({
      role: 'pot',
      d: `M${round(-w)} 0 L${round(-foot)} ${round(-h * 0.72)} Q0 ${round(-h * 1.34)} ${round(foot)} ${round(-h * 0.72)} L${round(w)} 0 Z`,
    });
  } else {
    const foot = w * 0.94;
    shapes.push({
      role: 'pot',
      d: `M${round(-w)} 0 L${round(-foot)} ${round(-h)} L${round(foot)} ${round(-h)} L${round(w)} 0 Z`,
    });
  }

  // Rim lip, flaring outward at the top
  shapes.push({
    role: 'rim',
    d: `M${round(-w * 1.07)} ${round(rim)} L${round(w * 1.07)} ${round(rim)} L${round(w)} 0 L${round(-w)} 0 Z`,
  });

  return { transform: 'translate(0 0)', shapes };
}

// ===== Organs =====

interface Options {
  /** Draw veins and variegation. Cards render silhouettes; only the detail view needs detail. */
  detail: boolean;
  /** Seeds the jitter in variegation, so a plant always carries the same markings */
  seed: string;
}

function leafGroups(
  organ: Extract<PlantOrgan, { kind: 'leaf' }>,
  grow: Growth,
  index: number,
  options: Options,
  random: Random
): RenderGroup[] {
  const length = organ.length * grow.scale;
  const ratio = organ.ratio ?? bladeDefaultRatio(organ.blade);
  const halfWidth = (length * ratio) / 2;
  const petiole = (organ.petiole ?? 0) * grow.scale;
  const angle = organAngle(organ.angle, organ.splay, grow);
  const groups: RenderGroup[] = [];

  // A leaf on a growing tip rides out from its origin node instead of waiting at its
  // final position, which would leave it hanging in mid-air ahead of the stem.
  const [ax, ay] = organ.origin
    ? [
        organ.origin[0] + (organ.at[0] - organ.origin[0]) * grow.eased,
        organ.origin[1] + (organ.at[1] - organ.origin[1]) * grow.eased,
      ]
    : organ.at;

  // rotate() is negated because the wrapper flips the y axis: without it a positive
  // angle would lean left, and the model authors positive as leaning right.
  const stalk = `translate(${round(ax)} ${round(ay)}) rotate(${round(-angle)})`;

  if (petiole > 0) {
    const bow = (organ.bow ?? 0) * grow.scale;
    groups.push({
      transform: stalk,
      shapes: [
        {
          role: 'stem',
          d: `M0 0 Q${round(bow)} ${round(petiole * 0.55)} 0 ${round(petiole)}`,
          width: 1.5,
        },
      ],
    });
  }

  const bloomRole = organ.bloom === 'warm' ? 'bloomWarm' : 'bloomPale';
  const curve = (organ.curve ?? 0) * grow.scale;
  const blade: Shape[] = [
    {
      role: organ.bloom ? bloomRole : 'blade',
      d: bladeOutline(organ.blade, length, halfWidth, curve),
      tone: organ.tone ?? 0,
    },
  ];

  const outline = blade[0].d;
  const clipId = `${options.seed}-leaf-${index}`;

  if (options.detail && !organ.bloom) {
    for (const mark of variegationMarks(
      organ.variegation ?? 'none',
      organ.blade,
      length,
      halfWidth,
      random,
      curve
    )) {
      blade.push({ role: 'mark', d: mark.d, opacity: mark.opacity, evenOdd: mark.evenOdd });
    }

    const pale = organ.variegation === 'light-veins';
    for (const vein of veinPaths(organ.blade, organ.veins ?? 'none', length, halfWidth, curve)) {
      blade.push({
        role: pale ? 'veinBright' : 'vein',
        d: vein,
        width: Math.max(pale ? 0.9 : 0.5, length * (pale ? 0.022 : 0.012)),
      });
    }
  }

  // The whole blade group is shifted, so the outline, veins and markings stay in step
  const shift = bladeOffset(organ.blade, length);
  groups.push({
    transform: `${stalk} translate(0 ${round(petiole)}) rotate(${round(-(organ.tipBend ?? 0))}) translate(0 ${round(shift)})`,
    clip: { id: clipId, d: outline },
    shapes: blade,
  });

  return groups;
}

function frondGroups(
  organ: Extract<PlantOrgan, { kind: 'frond' }>,
  grow: Growth,
  options: Options
): RenderGroup[] {
  const length = organ.length * grow.scale;
  const bow = (organ.bow ?? 0) * grow.scale;
  const angle = organAngle(organ.angle, organ.splay, grow);
  const blade: Blade = organ.blade ?? 'elliptic';
  const pitch = organ.pitch ?? 62;
  const bare = organ.bare ?? 0.28;
  const taper = organ.taper ?? 0.55;
  const rachis = `translate(${round(organ.at[0])} ${round(organ.at[1])}) rotate(${round(-angle)})`;
  const groups: RenderGroup[] = [];

  groups.push({
    transform: rachis,
    shapes: [
      {
        role: 'stem',
        d: `M0 0 Q${round(bow)} ${round(length * 0.55)} ${round(bow * 1.7)} ${round(length)}`,
        width: organ.thick ?? 2,
      },
    ],
  });

  for (let i = 1; i <= organ.pairs; i++) {
    const t = bare + ((i - 1) / Math.max(1, organ.pairs - 1)) * (1 - bare);
    // Sampled from the rachis curve itself, so leaflets sit on the axis rather than beside it
    const along = length * (1.1 * t * (1 - t) + t * t);
    const offset = bow * 2 * t * (1 - t) + bow * 1.7 * t * t;
    const leafLength = organ.leaflet * grow.scale * (1 - (1 - taper) * t);
    const ratio = organ.leafletRatio ?? bladeDefaultRatio(blade);
    const halfWidth = (leafLength * ratio) / 2;
    const outline = bladeOutline(blade, leafLength, halfWidth);

    for (const side of [-1, 1]) {
      const shapes: Shape[] = [
        { role: 'blade', d: outline, tone: organ.tone ?? 0 },
      ];
      if (options.detail && organ.veins && organ.veins !== 'none') {
        for (const vein of veinPaths(blade, organ.veins, leafLength, halfWidth)) {
          shapes.push({ role: 'vein', d: vein, width: Math.max(0.4, leafLength * 0.02) });
        }
      }
      groups.push({
        transform: `${rachis} translate(${round(offset)} ${round(along)}) rotate(${round(-side * pitch)})`,
        shapes,
      });
    }
  }

  return groups;
}

function stemGroup(
  organ: Extract<PlantOrgan, { kind: 'stem' }>,
  grow: Growth
): RenderGroup {
  const [fx, fy] = organ.from;
  const dx = (organ.to[0] - fx) * grow.eased;
  const dy = (organ.to[1] - fy) * grow.eased;
  const bow = (organ.bow ?? 0) * grow.eased;

  return {
    transform: `translate(${round(fx)} ${round(fy)})`,
    shapes: [
      {
        role: 'stem',
        d: `M0 0 Q${round(dx * 0.5 + bow)} ${round(dy * 0.5)} ${round(dx)} ${round(dy)}`,
        width: organ.thick ?? 2,
      },
    ],
  };
}

// ===== Frame =====

interface Extent {
  minX: number;
  maxX: number;
  maxY: number;
}

const RADIANS = Math.PI / 180;

/** Widens the extent to include a disc of radius r around (x, y) */
function include(extent: Extent, x: number, y: number, r: number): void {
  extent.minX = Math.min(extent.minX, x - r);
  extent.maxX = Math.max(extent.maxX, x + r);
  extent.maxY = Math.max(extent.maxY, y + r);
}

/** The angle an organ settles at once the plant is mature */
function finalAngle(angle: number, splay: number | undefined): number {
  return angle + Math.sign(angle || 1) * Math.abs(splay ?? 0);
}

/**
 * How much room the mature plant needs. Measured rather than authored: hand-tuned bounds are
 * the easiest thing to get wrong when drawing a new species, and getting it wrong means a
 * clipped portrait. Deliberately generous — a little slack reads as breathing room.
 */
function estimateExtent(model: PlantModel): Extent {
  const extent: Extent = { minX: 0, maxX: 0, maxY: 0 };

  if (model.pot) include(extent, 0, 0, model.pot.width * 0.56);

  for (const organ of model.organs) {
    if (organ.kind === 'stem') {
      const bow = Math.abs(organ.bow ?? 0);
      include(extent, organ.from[0], organ.from[1], bow);
      include(extent, organ.to[0], organ.to[1], bow);
      continue;
    }

    const angle = finalAngle(organ.angle, organ.splay) * RADIANS;

    if (organ.kind === 'frond') {
      const tipX = organ.at[0] + Math.sin(angle) * organ.length;
      const tipY = organ.at[1] + Math.cos(angle) * organ.length;
      // Leaflets stand out sideways from the rachis along its whole length
      const side = organ.leaflet + Math.abs(organ.bow ?? 0) * 1.7;
      include(extent, organ.at[0], organ.at[1], side);
      include(extent, tipX, tipY, side);
      continue;
    }

    const petiole = organ.petiole ?? 0;
    const jointX = organ.at[0] + Math.sin(angle) * petiole;
    const jointY = organ.at[1] + Math.cos(angle) * petiole;
    const bladeAngle = angle + (organ.tipBend ?? 0) * RADIANS;
    // A peltate blade is centred on the stalk rather than rising from it
    const reach = organ.blade === 'peltate' ? 0 : organ.length;
    const tipX = jointX + Math.sin(bladeAngle) * reach;
    const tipY = jointY + Math.cos(bladeAngle) * reach;
    const halfWidth = (organ.length * (organ.ratio ?? bladeDefaultRatio(organ.blade))) / 2;

    include(extent, organ.at[0], organ.at[1], Math.abs(organ.bow ?? 0));
    include(extent, jointX, jointY, halfWidth);
    include(extent, tipX, tipY, halfWidth + Math.abs(organ.curve ?? 0));
  }

  return extent;
}

const MARGIN = 4;

interface Frame {
  viewBox: string;
  flip: string;
}

function frameFor(model: PlantModel): Frame {
  const potHeight = model.pot ? model.pot.height : 0;

  if (model.bounds) {
    const { width, height, shiftX } = model.bounds;
    return {
      viewBox: `0 0 ${round(width)} ${round(height + PAD_TOP + potHeight)}`,
      flip: `translate(${round(width / 2 + (shiftX ?? 0))} ${round(height + PAD_TOP)}) scale(1 -1)`,
    };
  }

  const extent = estimateExtent(model);
  const width = extent.maxX - extent.minX + MARGIN * 2;
  const height = extent.maxY + MARGIN;

  return {
    viewBox: `0 0 ${round(width)} ${round(height + potHeight)}`,
    flip: `translate(${round(MARGIN - extent.minX)} ${round(height)}) scale(1 -1)`,
  };
}

// ===== Entry point =====

export function renderPlant(
  model: PlantModel,
  age: number,
  options: Options
): Render {
  const random = makeRandom(options.seed);
  const maturation = model.maturation ?? DEFAULT_MATURATION;
  const groups: RenderGroup[] = [];

  model.organs.forEach((organ, index) => {
    const grow = growth(organ.age, age, maturation);
    if (!grow) return;

    if (organ.kind === 'leaf') {
      groups.push(...leafGroups(organ, grow, index, options, random));
    } else if (organ.kind === 'frond') {
      groups.push(...frondGroups(organ, grow, options));
    } else {
      groups.push(stemGroup(organ, grow));
    }
  });

  // Last, so the rim covers the base of the leaves that grow out of the soil
  if (model.pot) groups.push(potShapes(model.pot));

  // The frame is measured from the mature plant, never from the current age, so a young
  // plant looks genuinely small in the frame instead of being rescaled to fill it.
  return { ...frameFor(model), groups };
}
