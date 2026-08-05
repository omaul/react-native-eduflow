import { describe, it, expect } from 'vitest';
import { buildPortrait, PORTRAIT_SIZE } from './plantPortrait';
import { LeafShape, PlantForm, PlantPalette, PlantVisual } from '../types/catalog';

const FORMS: PlantForm[] = [
  'upright',
  'rosette',
  'clump',
  'vine',
  'tree',
  'fern',
  'stone',
  'trap',
];

const LEAVES: LeafShape[] = [
  'heart',
  'split',
  'arrow',
  'oval',
  'round',
  'strap',
  'spike',
  'frond',
  'trap',
];

const PALETTES: PlantPalette[] = ['green', 'dark', 'silver', 'grey'];

const NUMBER_PATTERN = /-?\d+(\.\d+)?/g;

function everyCombination(): PlantVisual[] {
  return FORMS.flatMap((form) =>
    LEAVES.map((leaf) => ({ form, leaf, palette: 'green' as PlantPalette }))
  );
}

describe('buildPortrait', () => {
  it('is deterministic for the same traits and seed', () => {
    const visual: PlantVisual = { form: 'clump', leaf: 'split', palette: 'green' };
    const first = buildPortrait(visual, 'monstera-deliciosa');
    const second = buildPortrait(visual, 'monstera-deliciosa');
    expect(first).toEqual(second);
  });

  it('produces different layouts for different seeds', () => {
    const visual: PlantVisual = { form: 'clump', leaf: 'oval', palette: 'green' };
    const a = buildPortrait(visual, 'calathea');
    const b = buildPortrait(visual, 'begonia-maculata');
    expect(JSON.stringify(a.elements)).not.toBe(JSON.stringify(b.elements));
  });

  it('carries the palette through', () => {
    for (const palette of PALETTES) {
      const portrait = buildPortrait({ form: 'vine', leaf: 'heart', palette }, 'seed');
      expect(portrait.palette).toBe(palette);
    }
  });

  it('draws something for every form and leaf combination', () => {
    for (const visual of everyCombination()) {
      const portrait = buildPortrait(visual, `${visual.form}-${visual.leaf}`);
      expect(portrait.elements.length, `${visual.form}/${visual.leaf}`).toBeGreaterThan(0);
    }
  });

  it('never emits NaN or Infinity in paths or transforms', () => {
    for (const visual of everyCombination()) {
      for (const seed of ['a', 'plant-2', 'монстера', '']) {
        const portrait = buildPortrait(visual, seed);
        for (const element of portrait.elements) {
          const text = `${element.d} ${element.transform}`;
          expect(text, `${visual.form}/${visual.leaf}`).not.toMatch(/NaN|Infinity|undefined/);
        }
      }
    }
  });

  it('keeps every path coordinate within a sane range around the canvas', () => {
    for (const visual of everyCombination()) {
      const portrait = buildPortrait(visual, 'range-check');
      for (const element of portrait.elements) {
        for (const raw of element.d.match(NUMBER_PATTERN) ?? []) {
          const value = Number(raw);
          expect(Math.abs(value), `${visual.form}/${visual.leaf}: ${element.d}`).toBeLessThan(
            PORTRAIT_SIZE * 2
          );
        }
      }
    }
  });

  it('produces closed shapes for leaves and open paths for stems', () => {
    const portrait = buildPortrait({ form: 'clump', leaf: 'oval', palette: 'green' }, 'seed');
    const leaves = portrait.elements.filter((element) => element.kind === 'leaf');
    const stems = portrait.elements.filter((element) => element.kind === 'stem');
    expect(leaves.length).toBeGreaterThan(0);
    expect(stems.length).toBeGreaterThan(0);
    for (const leaf of leaves) expect(leaf.d.trim().endsWith('Z')).toBe(true);
    for (const stem of stems) expect(stem.d.trim().endsWith('Z')).toBe(false);
  });

  it('uses only tone indices the stylesheet defines', () => {
    for (const visual of everyCombination()) {
      for (const element of buildPortrait(visual, 'tones').elements) {
        expect([0, 1, 2]).toContain(element.tone);
      }
    }
  });

  it('gives stones no sway — a rock that waves in the wind is a bug', () => {
    const portrait = buildPortrait({ form: 'stone', leaf: 'oval', palette: 'grey' }, 'lithops');
    for (const element of portrait.elements) {
      expect(element.sway).toBe(0);
    }
  });

  it('falls back to a clump for an unknown form instead of drawing nothing', () => {
    const portrait = buildPortrait(
      { form: 'nonsense' as PlantForm, leaf: 'oval', palette: 'green' },
      'seed'
    );
    expect(portrait.elements.length).toBeGreaterThan(0);
  });
});
