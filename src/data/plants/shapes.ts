/**
 * Builders for the growth architectures that repeat across species.
 *
 * Three shapes cover most houseplants, and each one carries its own rule about the order leaves
 * appear in — which is the part the growth slider teaches:
 *
 * - `vine` — one growing tip. Oldest leaf at the base, newest at the tip, each riding out as its
 *   stem segment extends.
 * - `clump` — every leaf on its own petiole from the base. New ones come up through the middle,
 *   old ones get pushed outward (`splay`).
 * - `rosette` — leaves sitting straight on the base with no petiole. Same outward drift.
 *
 * Anything that does not fit — a trunk with a crown, a succulent shrub — is authored organ by
 * organ in the species file.
 */

import {
  Blade,
  LeafOrgan,
  PlantOrgan,
  StemOrgan,
  Tone,
  Variegation,
  Veins,
} from '../../types/plantModel';

/** Traits every leaf on a plant shares */
export interface LeafStyle {
  blade: Blade;
  ratio?: number;
  veins?: Veins;
  variegation?: Variegation;
}

/** Cycles the three palette shades so neighbouring leaves do not merge into one silhouette */
function tone(index: number): Tone {
  return (index % 3) as Tone;
}

// ===== Vine =====

export interface VineLeaf {
  /** Blade length at maturity */
  length: number;
  /** Degrees from vertical; the builder alternates the sign */
  angle: number;
  petiole: number;
  tipBend?: number;
}

/**
 * A climbing or trailing stem. `nodes` are the points the stem passes through, starting at the
 * soil; leaf i sits on node i+1 and rides out from node i while its segment grows.
 */
export function vine(
  nodes: [number, number][],
  leaves: VineLeaf[],
  style: LeafStyle,
  options: { thick?: number; startAge?: number } = {}
): PlantOrgan[] {
  const organs: PlantOrgan[] = [];
  const count = Math.min(leaves.length, nodes.length - 1);
  const start = options.startAge ?? 0;
  const span = 0.9 - start;
  const thick = options.thick ?? 2.4;

  for (let i = 0; i < count; i++) {
    const age = start + (i / count) * span;
    const from = nodes[i];
    const to = nodes[i + 1];
    const side = i % 2 === 0 ? -1 : 1;
    const leaf = leaves[i];
    // Segments thin out towards the tip, as the newest growth is the least woody
    const taper = thick * (1 - (i / Math.max(1, count)) * 0.4);

    const stem: StemOrgan = {
      kind: 'stem',
      age,
      from,
      to,
      bow: side * 3,
      thick: Math.round(taper * 10) / 10,
    };
    organs.push(stem);

    organs.push({
      kind: 'leaf',
      age,
      at: to,
      origin: from,
      angle: side * leaf.angle,
      length: leaf.length,
      petiole: leaf.petiole,
      bow: side * 2,
      tipBend: side * (leaf.tipBend ?? 10),
      tone: tone(i),
      ...style,
    });
  }

  return organs;
}

// ===== Clump =====

export interface ClumpLeaf {
  length: number;
  petiole: number;
  /** How far out this leaf ends up once the plant is mature */
  splay: number;
  tipBend?: number;
}

/**
 * Leaves on petioles straight from the base. Authored angles stay near vertical: the outward
 * lean comes from `splay`, which accumulates with the plant's age, so a young plant is a couple
 * of upright leaves rather than an already-spread bush.
 */
export function clump(leaves: ClumpLeaf[], style: LeafStyle): LeafOrgan[] {
  return leaves.map((leaf, i) => {
    const side = i % 2 === 0 ? -1 : 1;
    return {
      kind: 'leaf',
      age: (i / leaves.length) * 0.88,
      at: [0, 2],
      angle: side * (8 + (i % 3) * 3),
      splay: side * leaf.splay,
      length: leaf.length,
      petiole: leaf.petiole,
      bow: side * 4,
      tipBend: side * (leaf.tipBend ?? 10),
      tone: tone(i),
      ...style,
    };
  });
}

// ===== Rosette =====

export interface RosetteLeaf {
  length: number;
  splay: number;
  /**
   * How far the tip bends outward, as a share of the leaf's length. This bends the blade;
   * rotating it instead would just tip the whole leaf over until it lay flat.
   */
  arch?: number;
}

/** Leaves rising straight out of the base with no petiole: sansevieria, aloe, chlorophytum */
export function rosette(leaves: RosetteLeaf[], style: LeafStyle): LeafOrgan[] {
  return leaves.map((leaf, i) => {
    const side = i % 2 === 0 ? -1 : 1;
    return {
      kind: 'leaf',
      age: (i / leaves.length) * 0.88,
      at: [side * (i % 2 === 0 ? 1.5 : 1), 1],
      angle: side * (5 + (i % 3) * 4),
      splay: side * leaf.splay,
      length: leaf.length,
      curve: side * leaf.length * (leaf.arch ?? 0),
      tone: tone(i),
      ...style,
    };
  });
}
