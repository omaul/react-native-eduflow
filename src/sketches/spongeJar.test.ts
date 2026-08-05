/**
 * The sponge jar exists to teach one thing: a loose mix drains AND stays moist,
 * a dense one just floods. If the physics stops showing that, the note lies.
 *
 * p5 is replaced by a minimal stub with a seeded PRNG so runs are reproducible.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import type p5 from 'p5';
import { createSpongeJarSketch, SpongeJarStats, SpongeJarPreset } from './spongeJar';

function createP5Stub() {
  let seed = 42;
  const random = (min?: number, max?: number) => {
    // Deterministic LCG — no Math.random, so failures are reproducible
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    const unit = seed / 4294967296;
    if (min === undefined) return unit;
    if (max === undefined) return unit * min;
    return min + unit * (max - min);
  };

  const stub = {
    random,
    createCanvas: () => {},
    resizeCanvas: () => {},
    noStroke: () => {},
    stroke: () => {},
    strokeWeight: () => {},
    noFill: () => {},
    fill: () => {},
    rect: () => {},
    line: () => {},
    clear: () => {},
    loop: () => {
      stub.looping = true;
    },
    noLoop: () => {
      stub.looping = false;
    },
    looping: true,
    setup: undefined as undefined | (() => void),
    draw: undefined as undefined | (() => void),
    windowResized: undefined as undefined | (() => void),
  };

  return stub;
}

function run(preset: SpongeJarPreset, { pour = true, frames = 500 } = {}) {
  const container = document.createElement('div');
  let stats: SpongeJarStats = {
    aeration: 0,
    retained: 0,
    standing: 0,
    drained: 0,
    poured: 0,
  };

  const { sketch, api } = createSpongeJarSketch(container, (next) => {
    stats = next;
  });

  const stub = createP5Stub();
  sketch(stub as unknown as p5);
  stub.setup!();

  api.reset(preset);
  const afterBuild = stats;

  if (pour) api.pour();
  for (let frame = 0; frame < frames; frame++) {
    if (!stub.looping) break;
    stub.draw!();
  }

  // stats is read through a getter: the callback replaces it after this returns
  return { stats, afterBuild, stub, api, getStats: () => stats };
}

describe('sponge jar simulation', () => {
  let loose: ReturnType<typeof run>;
  let dense: ReturnType<typeof run>;
  let stones: ReturnType<typeof run>;

  beforeEach(() => {
    // Built once per test file would be faster, but per-test keeps them independent
  });

  it('a loose mix both drains and holds moisture', () => {
    loose = run('loose');
    expect(loose.stats.drained).toBeGreaterThan(0);
    expect(loose.stats.retained).toBeGreaterThan(0);
  });

  it('a loose mix keeps air pockets after watering', () => {
    loose = run('loose');
    expect(loose.stats.aeration).toBeGreaterThan(10);
  });

  it('a dense mix starts with almost no connected air', () => {
    dense = run('dense', { pour: false, frames: 5 });
    expect(dense.afterBuild.aeration).toBeLessThan(30);
  });

  it('a dense mix leaves water standing instead of draining it', () => {
    dense = run('dense');
    loose = run('loose');
    expect(dense.stats.standing).toBeGreaterThan(loose.stats.standing);
    expect(dense.stats.drained).toBeLessThan(loose.stats.drained);
  });

  it('a stones-only mix drains everything and retains nothing', () => {
    stones = run('stones');
    expect(stones.stats.retained).toBe(0);
    expect(stones.stats.drained).toBeGreaterThan(0);
  });

  it('a stones-only mix drains more than a loose mix', () => {
    stones = run('stones');
    loose = run('loose');
    expect(stones.stats.drained).toBeGreaterThan(loose.stats.drained);
  });

  it('conserves water: everything poured is drained, retained or standing', () => {
    loose = run('loose');
    const { poured, drained, retained, standing } = loose.stats;
    expect(poured).toBeGreaterThan(0);
    expect(drained + retained + standing).toBe(poured);
  });

  it('stops the draw loop once the simulation settles', () => {
    loose = run('loose', { frames: 2000 });
    expect(loose.stub.looping).toBe(false);
  });

  it('resumes the loop when watering again', () => {
    loose = run('loose', { frames: 2000 });
    expect(loose.stub.looping).toBe(false);
    loose.api.pour();
    expect(loose.stub.looping).toBe(true);
  });

  it('resets counters when the preset changes', () => {
    const result = run('loose');
    expect(result.stats.poured).toBeGreaterThan(0);
    result.api.reset('dense');
    // reset reports fresh stats through the callback
    expect(result.getStats().poured).toBe(0);
    expect(result.getStats().drained).toBe(0);
  });

  it('reports no water before the first watering', () => {
    const result = run('loose', { pour: false, frames: 5 });
    expect(result.afterBuild.poured).toBe(0);
    expect(result.afterBuild.drained).toBe(0);
    expect(result.afterBuild.retained).toBe(0);
  });
});
