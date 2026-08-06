/**
 * Authored plant models.
 *
 * A model describes a plant as an ordered set of organs, each with the age at which it
 * appears. The renderer turns (model, age) into SVG, so one authored file yields every
 * growth stage: at age 0.2 only the oldest organs exist, at age 1 all of them do. That
 * mirrors how the plants actually grow — a vine's oldest leaves sit at the base, a
 * rosette's oldest sit on the outside — which makes the growth slider teach something
 * instead of merely animating.
 *
 * Coordinates are authored with **+y pointing up** and the origin at the centre of the
 * soil line; the renderer flips the axis once. Units are arbitrary but models are drawn
 * at roughly 100 units tall.
 */

/** Blade outline families. Each maps to a width profile in src/utils/plantBlades.ts */
export type Blade =
  | 'cordate' // heart, lobed base — scindapsus, philodendron, epipremnum
  | 'elliptic' // oval — calathea, hoya, ficus
  | 'orbicular' // round, attached at the edge — peperomia
  | 'peltate' // round, petiole attached to the middle of the underside — pilea
  | 'linear' // long strap — sansevieria, dracaena, chlorophytum
  | 'lanceolate' // succulent spike, widest at the base — aloe
  | 'sagittate' // arrow with backward lobes — alocasia, anthurium
  | 'wing' // markedly asymmetric halves — begonia
  | 'fenestrate'; // slit blade — monstera

export type Veins = 'none' | 'midrib' | 'pinnate' | 'palmate' | 'parallel';

/** Leaf markings — the main thing that makes a species recognisable */
export type Variegation =
  | 'none'
  | 'silver-blotch' // scindapsus pictus
  | 'stripe' // calathea
  | 'spot' // begonia maculata, aloe
  | 'light-veins' // anthurium crystallinum, alocasia, melanochrysum
  | 'margin' // pale rim — dracaena marginata
  | 'midstripe' // pale centre — chlorophytum
  | 'band'; // cross banding — sansevieria

/** Palette shade index — resolved to a CSS custom property by the component */
export type Tone = 0 | 1 | 2;

interface Organ {
  /** Plant age at which this organ appears, 0..1 */
  age: number;
}

export interface LeafOrgan extends Organ {
  kind: 'leaf';
  /** Attachment point of the petiole once the leaf is mature */
  at: [number, number];
  /**
   * The node the leaf rides out from while it grows, normally the start of the stem segment
   * that carries it. A vine's new leaf sits on the growing tip, so without this the leaf
   * would hang in mid-air at its final position while the stem was still catching up.
   * Omit for leaves whose attachment never moves, such as a clump growing from the base.
   */
  origin?: [number, number];
  /** Degrees from vertical, positive leans right */
  angle: number;
  /**
   * Extra degrees the leaf drifts outward as the whole plant ages past its emergence.
   * A clump pushes its old leaves out as new ones come up through the middle, so without
   * this every leaf would be authored already splayed and a young plant would look wrong.
   */
  splay?: number;
  /** Blade length at maturity */
  length: number;
  /** Blade width as a fraction of length; falls back to the blade's own default */
  ratio?: number;
  /** Petiole length; 0 or omitted means the blade sits straight on the attachment point */
  petiole?: number;
  /** Sideways bow of the petiole, in units */
  bow?: number;
  /** Extra rotation of the blade relative to the petiole tip — a drooping or lifted tip */
  tipBend?: number;
  /**
   * Sideways bend of the blade itself, as the offset of its tip in model units; positive bends
   * right. This is how an arching strap is expressed. Rotating the blade instead would only tip
   * a sessile leaf over until it lay flat, which is not the same shape at all.
   */
  curve?: number;
  blade: Blade;
  veins?: Veins;
  variegation?: Variegation;
  tone?: Tone;
  /**
   * Draws the blade as a flower rather than a leaf. The white spathe of a spathiphyllum and the
   * red one of an anthurium are what people actually recognise, so they get their own colours
   * instead of a palette shade.
   */
  bloom?: 'pale' | 'warm';
}

/** A compound leaf: leaflets in pairs along a rachis — zamioculcas, adiantum */
export interface FrondOrgan extends Organ {
  kind: 'frond';
  at: [number, number];
  angle: number;
  /** See LeafOrgan.splay */
  splay?: number;
  /** Rachis length */
  length: number;
  /** Number of leaflet pairs */
  pairs: number;
  /** Leaflet length near the base of the rachis */
  leaflet: number;
  /** Leaflet length at the tip as a fraction of `leaflet` */
  taper?: number;
  /** Fraction of the rachis left bare before the first pair */
  bare?: number;
  /** Sideways bow of the rachis */
  bow?: number;
  /** Angle of the leaflets away from the rachis */
  pitch?: number;
  blade?: Blade;
  leafletRatio?: number;
  veins?: Veins;
  tone?: Tone;
  /** Rachis stroke width */
  thick?: number;
}

/** A bare axis: vine stem, trunk or offshoot */
export interface StemOrgan extends Organ {
  kind: 'stem';
  from: [number, number];
  to: [number, number];
  /** Sideways bow at the midpoint */
  bow?: number;
  thick?: number;
}

/** Not part of PlantOrgan: a model has at most one pot, so it needs no discriminator */
export interface PotOrgan {
  style: 'straight' | 'tapered' | 'hanging';
  width: number;
  height: number;
}

export type PlantOrgan = LeafOrgan | FrondOrgan | StemOrgan;

/** A labelled point on the age axis. The note is shown next to the growth slider. */
export interface GrowthStage {
  /** Age 0..1 */
  at: number;
  label: string;
  note: string;
}

export interface PlantModel {
  /**
   * Optional override for the frame. Normally leave it out: the renderer measures the mature
   * plant and fits the viewBox around it, which centres a lopsided plant automatically and
   * makes it impossible to author a drawing that gets clipped.
   */
  bounds?: { width: number; height: number; shiftX?: number };
  pot?: PotOrgan;
  organs: PlantOrgan[];
  stages: GrowthStage[];
  /**
   * How long an organ takes to reach full size, as a share of the age axis.
   * Smaller values snap new organs open, larger ones unfurl them slowly.
   */
  maturation?: number;
}
