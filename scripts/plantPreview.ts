/**
 * Dev tool: renders authored plant models to contact sheets so they can be checked by eye.
 *
 * Drawing a species blind does not work — the only way to tell a recognisable calathea from a
 * generic striped blob is to look at it. This script produces the sheets and, on macOS, turns
 * them into PNGs via Quick Look, which is the only SVG rasteriser available here.
 *
 *   npx vite-node scripts/plantPreview.ts -- --out tmp/preview
 *   npx vite-node scripts/plantPreview.ts -- --out tmp/preview --mode stages calathea
 *
 * Sheets are laid out as close to square as possible: qlmanage scales a thumbnail to fill its
 * square and crops the overflow, so a lopsided sheet silently loses columns or rows.
 */

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { PLANT_MODELS } from '../src/data/plants';
import { PlantModel } from '../src/types/plantModel';
import { renderPlant, Shape } from '../src/utils/plantRender';

const ROOT = path.resolve(import.meta.dirname, '..');
const CSS = path.join(ROOT, 'src/components/PlantPortrait.module.css');

// ===== Palette, read from the stylesheet so previews cannot drift from the app =====

interface Colors {
  tones: [string, string, string];
  stem: string;
  vein: string;
  mark: string;
  pot: string;
  rim: string;
  soil: string;
  bloomPale: string;
  bloomWarm: string;
}

function readPalettes(): Record<string, Colors> {
  const css = fs.readFileSync(CSS, 'utf8');

  /**
   * Merges every light-theme block for a selector: `.portrait` is declared twice, once for
   * layout and once for the pot colours, and only the second one carries the custom properties.
   */
  function block(selector: string): Record<string, string> {
    const pattern = new RegExp(`(^|\\n)\\.${selector}\\s*\\{([^}]*)\\}`, 'g');
    const vars: Record<string, string> = {};
    for (const match of css.matchAll(pattern)) {
      for (const line of match[2].split(';')) {
        const pair = line.match(/(--[\w-]+)\s*:\s*([^;]+)/);
        if (pair) vars[pair[1]] = pair[2].trim();
      }
    }
    return vars;
  }

  const shared = block('portrait');
  const palettes: Record<string, Colors> = {};

  for (const name of ['green', 'dark', 'silver', 'grey']) {
    const v = block(name);
    palettes[name] = {
      tones: [v['--portrait-1'], v['--portrait-2'], v['--portrait-3']],
      stem: v['--portrait-stem'],
      vein: v['--portrait-vein'],
      mark: v['--portrait-mark'],
      pot: shared['--portrait-pot'],
      rim: shared['--portrait-rim'],
      soil: shared['--portrait-soil'],
      bloomPale: shared['--portrait-bloom-pale'],
      bloomWarm: shared['--portrait-bloom-warm'],
    };
  }
  return palettes;
}

const PALETTES = readPalettes();

// ===== Drawing =====

function paint(shape: Shape, c: Colors): string {
  const stroke = (color: string, opacity = 1) =>
    `fill="none" stroke="${color}" stroke-width="${shape.width}" stroke-linecap="round" opacity="${opacity}"`;

  switch (shape.role) {
    case 'blade':
      return `fill="${c.tones[shape.tone ?? 0]}"`;
    case 'mark':
      return `fill="${c.mark}" opacity="${shape.opacity ?? 1}"${shape.evenOdd ? ' fill-rule="evenodd"' : ''}`;
    case 'bloomPale':
      return `fill="${c.bloomPale}"`;
    case 'bloomWarm':
      return `fill="${c.bloomWarm}"`;
    case 'veinBright':
      return stroke(c.mark);
    case 'vein':
      return stroke(c.vein, 0.7);
    case 'stem':
      return stroke(c.stem);
    case 'soil':
      return stroke(c.soil);
    case 'rim':
      return `fill="${c.rim}"`;
    case 'pot':
    default:
      return `fill="${c.pot}"`;
  }
}

let clipCounter = 0;

/** One model as a nested <svg>, placed at (x, y) */
function cell(
  model: PlantModel,
  id: string,
  palette: string,
  age: number,
  detail: boolean,
  x: number,
  y: number,
  size: number
): string {
  const render = renderPlant(model, age, { detail, seed: id });
  const colors = PALETTES[palette] ?? PALETTES.green;
  const defs: string[] = [];
  const body: string[] = [];
  const prefix = `c${clipCounter++}`;

  for (const group of render.groups) {
    const clipped = group.clip && group.shapes.some((s) => s.role === 'mark');
    const clipId = `${prefix}-${group.clip?.id ?? ''}`;
    if (clipped) defs.push(`<clipPath id="${clipId}"><path d="${group.clip!.d}"/></clipPath>`);
    body.push(`<g transform="${group.transform}">`);
    for (const shape of group.shapes) {
      const clip = shape.role === 'mark' && clipped ? ` clip-path="url(#${clipId})"` : '';
      body.push(`<path d="${shape.d}" ${paint(shape, colors)}${clip}/>`);
    }
    body.push('</g>');
  }

  return `<svg x="${x}" y="${y}" width="${size}" height="${size}" viewBox="${render.viewBox}"><defs>${defs.join('')}</defs><g transform="${render.flip}">${body.join('')}</g></svg>`;
}

function sheet(width: number, height: number, body: string[]): string {
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" font-family="Helvetica, sans-serif">`,
    `<rect width="${width}" height="${height}" fill="#fdfdfb"/>`,
    ...body,
    '</svg>',
  ].join('\n');
}

// ===== Layouts =====

const SIZE = 190;
const GAP = 8;
const LABEL = 18;

interface Entry {
  id: string;
  model: PlantModel;
  palette: string;
  name: string;
}

/**
 * Picks the column count whose sheet comes out closest to square. Quick Look scales a
 * thumbnail to fill its square and crops the overflow, so any sheet far from 1:1 silently
 * loses its right-hand columns or its bottom rows.
 */
function bestColumns(count: number): number {
  let best = 1;
  let bestError = Infinity;
  for (let cols = 1; cols <= count; cols++) {
    const rows = Math.ceil(count / cols);
    const aspect = (cols * (SIZE + GAP) + GAP) / (rows * (SIZE + LABEL + GAP) + GAP);
    const error = Math.abs(Math.log(aspect));
    if (error < bestError) {
      bestError = error;
      best = cols;
    }
  }
  return best;
}

/** Every model at maturity */
function gridSheet(entries: Entry[], detail: boolean): string {
  const cols = bestColumns(entries.length);
  const rows = Math.ceil(entries.length / cols);
  const cellH = SIZE + LABEL;
  const width = cols * (SIZE + GAP) + GAP;
  const height = rows * (cellH + GAP) + GAP;
  const body: string[] = [];

  entries.forEach((entry, i) => {
    const x = GAP + (i % cols) * (SIZE + GAP);
    const y = GAP + Math.floor(i / cols) * (cellH + GAP);
    body.push(`<rect x="${x}" y="${y}" width="${SIZE}" height="${SIZE}" fill="#fff" stroke="#eaeae4"/>`);
    body.push(cell(entry.model, entry.id, entry.palette, 1, detail, x, y, SIZE));
    body.push(
      `<text x="${x + SIZE / 2}" y="${y + SIZE + 13}" font-size="11" fill="#555" text-anchor="middle">${entry.name}</text>`
    );
  });

  return sheet(width, height, body);
}

/** One species across its growth stages, 2 by 2 */
function stagesSheet(entry: Entry): string {
  const ages = entry.model.stages.map((stage) => stage.at);
  const cellH = SIZE + LABEL;
  const width = 2 * (SIZE + GAP) + GAP;
  const height = 24 + Math.ceil(ages.length / 2) * (cellH + GAP);
  const body: string[] = [
    `<text x="${GAP}" y="16" font-size="12" font-weight="600" fill="#222">${entry.name}</text>`,
  ];

  ages.forEach((age, i) => {
    const x = GAP + (i % 2) * (SIZE + GAP);
    const y = 24 + Math.floor(i / 2) * (cellH + GAP);
    body.push(`<rect x="${x}" y="${y}" width="${SIZE}" height="${SIZE}" fill="#fff" stroke="#eaeae4"/>`);
    body.push(cell(entry.model, entry.id, entry.palette, age, true, x, y, SIZE));
    body.push(
      `<text x="${x + SIZE / 2}" y="${y + SIZE + 13}" font-size="11" fill="#777" text-anchor="middle">${entry.model.stages[i].label}</text>`
    );
  });

  return sheet(width, height, body);
}

// ===== Entry point =====

interface Catalogue {
  items: { id: string; name: string; visual?: { palette: string } }[];
}

function main(): void {
  const argv = process.argv.slice(2);
  const outIndex = argv.indexOf('--out');
  const out = outIndex >= 0 ? argv[outIndex + 1] : 'tmp/preview';
  const sizeIndex = argv.indexOf('--size');
  const size = sizeIndex >= 0 ? argv[sizeIndex + 1] : '1400';
  const modeIndex = argv.indexOf('--mode');
  const mode = modeIndex >= 0 ? argv[modeIndex + 1] : 'grid';
  const ids = argv.filter(
    (arg, i) => !arg.startsWith('--') && argv[i - 1] !== '--out' && argv[i - 1] !== '--mode' && argv[i - 1] !== '--size'
  );

  const catalogue: Catalogue = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'public/content/species/catalog.json'), 'utf8')
  );
  const meta = new Map(catalogue.items.map((item) => [item.id, item]));

  const entries: Entry[] = Object.entries(PLANT_MODELS)
    .filter(([id]) => ids.length === 0 || ids.includes(id))
    .map(([id, model]) => ({
      id,
      model,
      palette: meta.get(id)?.visual?.palette ?? 'green',
      name: meta.get(id)?.name ?? id,
    }))
    .sort((a, b) => a.name.localeCompare(b.name, 'ru'));

  if (entries.length === 0) {
    console.error('Нет моделей для отрисовки. Проверь id.');
    process.exit(1);
  }

  const dir = path.resolve(ROOT, out);
  fs.mkdirSync(dir, { recursive: true });

  const files: string[] = [];
  if (mode === 'stages') {
    for (const entry of entries) {
      const file = path.join(dir, `stages-${entry.id}.svg`);
      fs.writeFileSync(file, stagesSheet(entry));
      files.push(file);
    }
  } else {
    // Silhouettes are what the cards actually show, so they get checked too
    const grid = path.join(dir, 'grid.svg');
    fs.writeFileSync(grid, gridSheet(entries, true));
    files.push(grid);
    const cards = path.join(dir, 'cards.svg');
    fs.writeFileSync(cards, gridSheet(entries, false));
    files.push(cards);
  }

  for (const file of files) {
    fs.rmSync(`${file}.png`, { force: true });
    try {
      execFileSync('qlmanage', ['-t', '-s', size, '-o', dir, file], { stdio: 'ignore' });
    } catch {
      console.warn(`qlmanage не сработал для ${file} — открой SVG вручную`);
    }
    console.log(`${file}.png`);
  }
}

main();
