/**
 * Types for the browsable catalogs in public/content/{species,components}/catalog.json
 *
 * Every field beyond the required core is optional on purpose: a new parameter can
 * be added to the data and surfaced by adding one entry to the field spec in
 * src/utils/catalogFields.ts — no page changes needed.
 */

export type Level = 'low' | 'medium' | 'high';

// ===== Components =====

export type ComponentRole = 'aerator' | 'retainer' | 'mineral' | 'nutrition' | 'antiseptic';
export type PhEffect = 'acidifies' | 'neutral' | 'alkalizes';
export type Thermal = 'cold' | 'neutral';

export interface SubstrateComponent {
  id: string;
  name: string;
  aliases?: string[];
  roles: ComponentRole[];
  /** false — the master class advises against it, and the catalog says why */
  recommended: boolean;
  summary: string;
  ph?: [number, number];
  phEffect: PhEffect;
  moisture: Level;
  aeration: Level;
  /** Cold components risk chilling roots near winter glass */
  thermal: Thermal;
  fractions?: string[];
  /** Suggested share of the mix, e.g. "20–30%" */
  share?: string;
  pros: string[];
  cons: string[];
  tips?: string[];
  relatedNotes?: string[];
}

// ===== Plants =====

export type LightLevel = 'shade' | 'partial' | 'bright-indirect' | 'direct';
export type WaterMode = 'keep-moist' | 'dry-top' | 'dry-through';
export type RootSize = 'fine' | 'medium' | 'thick';
export type FractionSize = 'fine' | 'medium' | 'coarse';
export type Rarity = 'common' | 'interesting' | 'rare';
export type GrowthRate = 'slow' | 'medium' | 'fast';

// ===== Portrait traits =====

/** Overall growth architecture — decides how the portrait is assembled */
export type PlantForm =
  | 'upright'
  | 'rosette'
  | 'clump'
  | 'vine'
  | 'tree'
  | 'fern'
  | 'stone'
  | 'trap';

export type LeafShape =
  | 'heart'
  | 'split'
  | 'arrow'
  | 'oval'
  | 'round'
  | 'strap'
  | 'spike'
  | 'frond'
  | 'trap';

export type PlantPalette = 'green' | 'dark' | 'silver' | 'grey';

/** Traits the generative portrait is drawn from (see src/utils/plantPortrait.ts) */
export interface PlantVisual {
  form: PlantForm;
  leaf: LeafShape;
  palette: PlantPalette;
}

/** A substrate recommendation pointing at an id from the components catalog */
export interface SubstrateAdvice {
  component: string;
  share?: string;
  why?: string;
}

export interface PlantSubstrate {
  ph?: [number, number];
  prefer?: SubstrateAdvice[];
  avoid?: SubstrateAdvice[];
  note?: string;
}

export interface Plant {
  id: string;
  name: string;
  latin: string;
  family?: string;
  aliases?: string[];
  rarity: Rarity;
  /** 1 — неубиваемое, 5 — требует опыта */
  difficulty: 1 | 2 | 3 | 4 | 5;
  summary: string;
  light: LightLevel;
  lightNote?: string;
  water: WaterMode;
  waterNote?: string;
  humidity: Level;
  temp?: [number, number];
  roots?: { size: RootSize; fraction: FractionSize };
  substrate?: PlantSubstrate;
  pot?: string;
  toxicToPets?: boolean;
  growth?: GrowthRate;
  propagation?: string[];
  quirk?: string;
  visual?: PlantVisual;
  tags?: string[];
  relatedNotes?: string[];
  /** true when public/content/species/<id>/index.md exists */
  article?: boolean;
}

export interface Catalog<T> {
  items: T[];
}
