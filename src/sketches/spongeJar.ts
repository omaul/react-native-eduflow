/**
 * "Ваза с губками и шариками для пинг-понга" — the analogy from the master class,
 * made touchable.
 *
 * Cellular (falling-sand) physics on a grid:
 *   - balls (перлит, разрыхлители) are impermeable but leave connected air channels
 *   - sponges (кокос, торф, мох) absorb one drop each and turn wet
 *   - dense peat blocks water almost completely: its pores are isolated, not connected
 *   - water drains through holes in the bottom
 *
 * The lesson emerges from the rules rather than from the text: a loose mix drains
 * AND stays moist, a dense one just becomes a swamp with nowhere for air to go.
 *
 * p5 INSTANCE mode — all calls go through `p.*`.
 */

import p5 from 'p5';

const CELL = 7;
const CANVAS_HEIGHT = 340;
const HEADROOM_ROWS = 6;
const POUR_AMOUNT = 240;
const POUR_RATE = 8;
const IDLE_FRAMES_BEFORE_PAUSE = 40;
const LATERAL_REACH = 16;

const AIR = 0;
const GLASS = 1;
const HOLE = 2;
const BALL = 3;
const SPONGE = 4;
const SPONGE_WET = 5;
const PEAT = 6;
const PEAT_WET = 7;
const WATER = 8;

export type SpongeJarPreset = 'loose' | 'dense' | 'stones';

export interface SpongeJarStats {
  /** Share of connected air pockets inside the jar, % */
  aeration: number;
  /** Drops held by sponges — available to roots, with air still around them */
  retained: number;
  /**
   * Drops going nowhere: free water plus water soaked into dense peat.
   * Saturated peat counts as stagnation, not as moisture held: there is no air
   * left in it, which is exactly what "залив" means.
   */
  standing: number;
  /** Drops that left through the drainage holes */
  drained: number;
  /** Drops poured so far */
  poured: number;
}

export interface SpongeJarApi {
  pour(): void;
  reset(preset: SpongeJarPreset): void;
}

interface Recipe {
  sponge: number;
  ball: number;
  peat: number;
  ballRadius: number;
  /** Dense mixes are generated solid-first, with isolated pores carved out */
  solid?: boolean;
  porosity?: number;
}

/**
 * Shares are tuned so the air phase stays above the 2D percolation threshold (~0.59)
 * in the loose mixes and well below it in the dense one. This grid is a 2D slice of a
 * 3D reality where water percolates far more easily, so a mix that drains in a real pot
 * must be drawn more open here than its literal volume fraction would suggest.
 */
const RECIPES: Record<SpongeJarPreset, Recipe> = {
  loose: { sponge: 0.22, ball: 0.18, peat: 0, ballRadius: 2.1 },
  dense: { sponge: 0.05, ball: 0.03, peat: 0, ballRadius: 1.4, solid: true, porosity: 0.2 },
  stones: { sponge: 0, ball: 0.38, peat: 0, ballRadius: 2.6 },
};

// Material colours — these stand for real things, so they are deliberate, not tokens.
const COLORS = {
  water: [74, 144, 194] as const,
  spongeDry: [216, 185, 140] as const,
  spongeWet: [154, 122, 78] as const,
  ball: [232, 232, 232] as const,
  ballDark: [200, 200, 200] as const,
  peatDry: [107, 79, 58] as const,
  peatWet: [63, 45, 32] as const,
};

function readCssColor(name: string, fallback: string): string {
  if (typeof window === 'undefined') return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
}

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function createSpongeJarSketch(
  container: HTMLElement,
  onStats: (stats: SpongeJarStats) => void
): { sketch: (p: p5) => void; api: SpongeJarApi } {
  const state = {
    grid: new Uint8Array(0),
    cols: 0,
    rows: 0,
    preset: 'loose' as SpongeJarPreset,
    pourQueue: 0,
    drained: 0,
    poured: 0,
    idleFrames: 0,
    sweepRight: true,
    borderColor: '#e5e5e5',
    mutedColor: '#888888',
  };

  let instance: p5 | null = null;

  const idx = (x: number, y: number) => y * state.cols + x;
  const at = (x: number, y: number) => {
    if (x < 0 || y < 0 || x >= state.cols || y >= state.rows) return GLASS;
    return state.grid[idx(x, y)];
  };
  const set = (x: number, y: number, value: number) => {
    state.grid[idx(x, y)] = value;
  };

  function regionBounds() {
    return { x0: 1, x1: state.cols - 2, y0: HEADROOM_ROWS, y1: state.rows - 2 };
  }

  function stampDisc(cx: number, cy: number, radius: number, value: number): number {
    const { x0, x1, y0, y1 } = regionBounds();
    let placed = 0;
    const r = Math.ceil(radius);
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        if (dx * dx + dy * dy > radius * radius) continue;
        const x = cx + dx;
        const y = cy + dy;
        if (x < x0 || x > x1 || y < y0 || y > y1) continue;
        if (at(x, y) !== AIR) continue;
        set(x, y, value);
        placed++;
      }
    }
    return placed;
  }

  function fillMaterial(p: p5, share: number, radius: number, value: number, regionCells: number) {
    const target = Math.floor(share * regionCells);
    if (target <= 0) return;
    const { x0, x1, y0, y1 } = regionBounds();
    let placed = 0;
    let attempts = 0;
    const maxAttempts = target * 12 + 500;
    while (placed < target && attempts < maxAttempts) {
      attempts++;
      const cx = Math.floor(p.random(x0, x1 + 1));
      const cy = Math.floor(p.random(y0, y1 + 1));
      placed += stampDisc(cx, cy, p.random(radius * 0.7, radius), value);
    }
  }

  function build(p: p5, preset: SpongeJarPreset) {
    state.preset = preset;
    state.grid = new Uint8Array(state.cols * state.rows);
    state.pourQueue = 0;
    state.drained = 0;
    state.poured = 0;
    state.idleFrames = 0;

    // Jar walls
    for (let y = 0; y < state.rows; y++) {
      set(0, y, GLASS);
      set(state.cols - 1, y, GLASS);
    }
    // The floor drains freely along its whole length. That is deliberate: the point of
    // the simulation is to compare mixes, so the pot must not be what holds water back.
    const bottom = state.rows - 1;
    for (let x = 0; x < state.cols; x++) set(x, bottom, GLASS);
    for (let x = 1; x < state.cols - 1; x++) set(x, bottom, HOLE);

    const { x0, x1, y0, y1 } = regionBounds();
    const regionCells = (x1 - x0 + 1) * (y1 - y0 + 1);
    const recipe = RECIPES[preset];

    if (recipe.solid) {
      // Dense peat: solid body with isolated pores, so no channel ever forms
      for (let y = y0; y <= y1; y++) {
        for (let x = x0; x <= x1; x++) {
          set(x, y, p.random() < (recipe.porosity ?? 0.2) ? AIR : PEAT);
        }
      }
      // A little perlite and coco, as in a bag mix — not enough to change the physics
      fillMaterial(p, recipe.ball, recipe.ballRadius, BALL, regionCells);
      fillMaterial(p, recipe.sponge, 1.6, SPONGE, regionCells);
    } else {
      fillMaterial(p, recipe.ball, recipe.ballRadius, BALL, regionCells);
      fillMaterial(p, recipe.sponge, 1.9, SPONGE, regionCells);
    }
  }

  function stats(): SpongeJarStats {
    const { x0, x1, y0, y1 } = regionBounds();
    const regionCells = Math.max(1, (x1 - x0 + 1) * (y1 - y0 + 1));
    let air = 0;
    let retained = 0;
    let standing = 0;

    // Aeration and held moisture are properties of the substrate zone
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const cell = at(x, y);
        if (cell === AIR) air++;
        else if (cell === SPONGE_WET) retained++;
        else if (cell === PEAT_WET) standing++;
      }
    }

    // Free water counts wherever it is, including the puddle standing on top —
    // that puddle is the whole point of the dense mix
    for (let y = 0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        if (at(x, y) === WATER) standing++;
      }
    }
    return {
      aeration: Math.round((air / regionCells) * 100),
      retained,
      standing,
      drained: state.drained,
      poured: state.poured,
    };
  }

  /**
   * Looks sideways for a cell the drop could descend from, and returns the direction
   * to step towards it. Water never wanders at random: it only moves sideways when
   * that makes progress, so puddles find the drainage holes instead of shuffling in
   * place forever.
   */
  function findLateralEscape(x: number, y: number, first: number): number {
    for (const dx of [first, -first]) {
      for (let distance = 1; distance <= LATERAL_REACH; distance++) {
        const nx = x + dx * distance;
        if (at(nx, y) !== AIR) break; // path along the row is blocked
        const under = at(nx, y + 1);
        if (under === AIR || under === HOLE || under === SPONGE) return dx;
      }
    }
    return 0;
  }

  function moveWater(p: p5, x: number, y: number): boolean {
    const below = at(x, y + 1);

    if (below === AIR) {
      set(x, y, AIR);
      set(x, y + 1, WATER);
      return true;
    }
    if (below === HOLE) {
      set(x, y, AIR);
      state.drained++;
      return true;
    }
    if (below === SPONGE) {
      set(x, y, AIR);
      set(x, y + 1, SPONGE_WET);
      return true;
    }

    // A soaked sponge is full, not a lid: water percolates through it to whatever is
    // below. Without this the first drops would seal the surface and everything else
    // would perch on top — which is the behaviour of dense peat, not of a loose mix.
    if (below === SPONGE_WET) {
      const under = at(x, y + 2);
      if (under === AIR) {
        set(x, y, AIR);
        set(x, y + 2, WATER);
        return true;
      }
      if (under === HOLE) {
        set(x, y, AIR);
        state.drained++;
        return true;
      }
      if (under === SPONGE) {
        set(x, y, AIR);
        set(x, y + 2, SPONGE_WET);
        return true;
      }
    }

    if (below === PEAT && p.random() < 0.22) {
      set(x, y, AIR);
      set(x, y + 1, PEAT_WET);
      return true;
    }

    // Blocked underneath — try to slip diagonally past the particle
    const first = p.random() < 0.5 ? -1 : 1;
    for (const dx of [first, -first]) {
      if (at(x + dx, y + 1) === AIR) {
        set(x, y, AIR);
        set(x + dx, y + 1, WATER);
        return true;
      }
      if (at(x + dx, y + 1) === HOLE) {
        set(x, y, AIR);
        state.drained++;
        return true;
      }
    }

    // Flow sideways, but only towards somewhere it can actually descend
    const escape = findLateralEscape(x, y, first);
    if (escape !== 0 && at(x + escape, y) === AIR) {
      set(x, y, AIR);
      set(x + escape, y, WATER);
      return true;
    }

    return false;
  }

  function step(p: p5): number {
    let moves = 0;

    if (state.pourQueue > 0) {
      for (let n = 0; n < POUR_RATE && state.pourQueue > 0; n++) {
        const x = Math.floor(p.random(1, state.cols - 1));
        if (at(x, 1) === AIR) {
          set(x, 1, WATER);
          state.pourQueue--;
          state.poured++;
          moves++;
        }
      }
    }

    state.sweepRight = !state.sweepRight;
    for (let y = state.rows - 2; y >= 0; y--) {
      if (state.sweepRight) {
        for (let x = 1; x < state.cols - 1; x++) {
          if (at(x, y) === WATER && moveWater(p, x, y)) moves++;
        }
      } else {
        for (let x = state.cols - 2; x >= 1; x--) {
          if (at(x, y) === WATER && moveWater(p, x, y)) moves++;
        }
      }
    }

    return moves;
  }

  function cellColor(p: p5, cell: number): [number, number, number] | null {
    switch (cell) {
      case WATER:
        return [...COLORS.water];
      case SPONGE:
        return [...COLORS.spongeDry];
      case SPONGE_WET:
        return [...COLORS.spongeWet];
      case BALL:
        return [...COLORS.ball];
      case PEAT:
        return [...COLORS.peatDry];
      case PEAT_WET:
        return [...COLORS.peatWet];
      default:
        return null;
    }
  }

  const sketch = (p: p5) => {
    instance = p;
    const reduced = prefersReducedMotion();
    const stepsPerFrame = reduced ? 24 : 2;
    let framesSinceStats = 0;

    p.setup = () => {
      const width = container.offsetWidth || 600;
      p.createCanvas(width, CANVAS_HEIGHT);
      p.noStroke();
      state.cols = Math.max(20, Math.floor(width / CELL));
      state.rows = Math.floor(CANVAS_HEIGHT / CELL);
      state.borderColor = readCssColor('--color-border', '#e5e5e5');
      state.mutedColor = readCssColor('--color-text-muted', '#888888');
      build(p, state.preset);
      onStats(stats());
    };

    p.draw = () => {
      if (framesSinceStats % 30 === 0) {
        state.borderColor = readCssColor('--color-border', '#e5e5e5');
        state.mutedColor = readCssColor('--color-text-muted', '#888888');
      }

      let moves = 0;
      for (let n = 0; n < stepsPerFrame; n++) moves += step(p);

      p.clear();

      // Cells
      for (let y = 0; y < state.rows; y++) {
        for (let x = 0; x < state.cols; x++) {
          const color = cellColor(p, at(x, y));
          if (!color) continue;
          p.fill(color[0], color[1], color[2]);
          p.rect(x * CELL, y * CELL, CELL, CELL);
        }
      }

      // Jar outline, with the drainage holes left open
      p.noFill();
      p.stroke(state.borderColor);
      p.strokeWeight(1.5);
      const top = HEADROOM_ROWS * CELL - CELL;
      p.line(CELL, top, CELL, (state.rows - 1) * CELL);
      p.line((state.cols - 1) * CELL, top, (state.cols - 1) * CELL, (state.rows - 1) * CELL);
      // Dashed floor — reads as a perforated bottom water can leave through
      const floorY = (state.rows - 1) * CELL;
      for (let x = 1; x < state.cols - 1; x += 2) {
        p.line(x * CELL, floorY, (x + 1) * CELL, floorY);
      }
      p.noStroke();

      framesSinceStats++;
      if (framesSinceStats % 10 === 0) onStats(stats());

      // Idle detection — a still simulation should not keep the GPU awake
      if (moves === 0 && state.pourQueue === 0) {
        state.idleFrames++;
        if (state.idleFrames > IDLE_FRAMES_BEFORE_PAUSE) {
          onStats(stats());
          p.noLoop();
        }
      } else {
        state.idleFrames = 0;
      }
    };

    p.windowResized = () => {
      const width = container.offsetWidth || 600;
      p.resizeCanvas(width, CANVAS_HEIGHT);
      state.cols = Math.max(20, Math.floor(width / CELL));
      build(p, state.preset);
      onStats(stats());
      p.loop();
    };
  };

  const api: SpongeJarApi = {
    pour() {
      state.pourQueue += POUR_AMOUNT;
      state.idleFrames = 0;
      instance?.loop();
    },
    reset(preset: SpongeJarPreset) {
      if (!instance || state.cols === 0) {
        state.preset = preset;
        return;
      }
      build(instance, preset);
      onStats(stats());
      instance.loop();
    },
  };

  return { sketch, api };
}
