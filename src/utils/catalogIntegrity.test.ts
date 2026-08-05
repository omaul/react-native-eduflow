/**
 * Guards the links between content files. These catalogs are edited by hand, and a
 * renamed id or a moved note silently breaks a cross-link that nothing else checks.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { Catalog, Plant, SubstrateComponent } from '../types/catalog';
import { ContentIndex } from '../types';

const CONTENT = join(process.cwd(), 'public', 'content');

function readJson<T>(...segments: string[]): T {
  return JSON.parse(readFileSync(join(CONTENT, ...segments), 'utf-8')) as T;
}

const index = readJson<ContentIndex>('index.json');
const plants = readJson<Catalog<Plant>>('species', 'catalog.json').items;
const components = readJson<Catalog<SubstrateComponent>>('components', 'catalog.json').items;

const noteSlugs = new Set(index.notes.map((note) => note.slug));
const componentIds = new Set(components.map((component) => component.id));
const plantIds = new Set(plants.map((plant) => plant.id));

describe('notes manifest', () => {
  it('has a markdown file for every note', () => {
    const missing = index.notes.filter(
      (note) =>
        !existsSync(join(CONTENT, `${note.slug}/index.md`)) &&
        !existsSync(join(CONTENT, `${note.slug}.md`))
    );
    expect(missing.map((note) => note.slug)).toEqual([]);
  });

  it('has unique slugs', () => {
    expect(noteSlugs.size).toBe(index.notes.length);
  });

  it('declares every subtopic used by a note', () => {
    const undeclared: string[] = [];
    for (const note of index.notes) {
      const [folder, subtopic, rest] = note.slug.split('/');
      if (!rest) continue;
      if (!index.folders[folder]?.subtopics?.[subtopic]) undeclared.push(note.slug);
    }
    expect(undeclared).toEqual([]);
  });
});

describe('components catalog', () => {
  it('has unique ids', () => {
    expect(componentIds.size).toBe(components.length);
  });

  it('links only to notes that exist', () => {
    const broken = components.flatMap((component) =>
      (component.relatedNotes ?? [])
        .filter((slug) => !noteSlugs.has(slug))
        .map((slug) => `${component.id} → ${slug}`)
    );
    expect(broken).toEqual([]);
  });

  it('gives every component at least one pro and one con', () => {
    const thin = components.filter(
      (component) => component.pros.length === 0 || component.cons.length === 0
    );
    expect(thin.map((component) => component.id)).toEqual([]);
  });
});

describe('plants catalog', () => {
  it('has unique ids', () => {
    expect(plantIds.size).toBe(plants.length);
  });

  it('recommends only components that exist', () => {
    const broken = plants.flatMap((plant) =>
      [...(plant.substrate?.prefer ?? []), ...(plant.substrate?.avoid ?? [])]
        .filter((advice) => !componentIds.has(advice.component))
        .map((advice) => `${plant.id} → ${advice.component}`)
    );
    expect(broken).toEqual([]);
  });

  it('never recommends and rejects the same component', () => {
    const conflicts = plants
      .filter((plant) => {
        const prefer = new Set((plant.substrate?.prefer ?? []).map((a) => a.component));
        return (plant.substrate?.avoid ?? []).some((a) => prefer.has(a.component));
      })
      .map((plant) => plant.id);
    expect(conflicts).toEqual([]);
  });

  it('links only to notes that exist', () => {
    const broken = plants.flatMap((plant) =>
      (plant.relatedNotes ?? [])
        .filter((slug) => !noteSlugs.has(slug))
        .map((slug) => `${plant.id} → ${slug}`)
    );
    expect(broken).toEqual([]);
  });

  it('has an article file for every plant flagged with article: true', () => {
    const missing = plants
      .filter((plant) => plant.article)
      .filter((plant) => !existsSync(join(CONTENT, 'species', plant.id, 'index.md')))
      .map((plant) => plant.id);
    expect(missing).toEqual([]);
  });

  it('gives every plant portrait traits with valid values', () => {
    const forms = new Set([
      'upright',
      'rosette',
      'clump',
      'vine',
      'tree',
      'fern',
      'stone',
      'trap',
    ]);
    const leaves = new Set([
      'heart',
      'split',
      'arrow',
      'oval',
      'round',
      'strap',
      'spike',
      'frond',
      'trap',
    ]);
    const palettes = new Set(['green', 'dark', 'silver', 'grey']);

    const problems = plants
      .filter(
        (plant) =>
          !plant.visual ||
          !forms.has(plant.visual.form) ||
          !leaves.has(plant.visual.leaf) ||
          !palettes.has(plant.visual.palette)
      )
      .map((plant) => plant.id);
    expect(problems).toEqual([]);
  });

  it('keeps difficulty within 1–5', () => {
    const bad = plants.filter((plant) => plant.difficulty < 1 || plant.difficulty > 5);
    expect(bad.map((plant) => plant.id)).toEqual([]);
  });
});

describe('cross-links inside notes', () => {
  it('points every #/note/... link at an existing note', () => {
    const broken: string[] = [];
    for (const note of index.notes) {
      const path = existsSync(join(CONTENT, `${note.slug}/index.md`))
        ? join(CONTENT, `${note.slug}/index.md`)
        : join(CONTENT, `${note.slug}.md`);
      if (!existsSync(path)) continue;
      const body = readFileSync(path, 'utf-8');
      for (const match of body.matchAll(/\(#\/note\/([^)\s]+)\)/g)) {
        if (!noteSlugs.has(match[1])) broken.push(`${note.slug} → ${match[1]}`);
      }
    }
    expect(broken).toEqual([]);
  });
});
