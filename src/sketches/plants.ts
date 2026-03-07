import p5 from 'p5';

// Simple hash to get deterministic number from string
function hashSeed(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

// ===== Element 1: Growing branches with flowers =====

interface Branch {
  x: number; y: number; angle: number; length: number;
  thickness: number; growProgress: number; growSpeed: number;
  children: Branch[]; hasFlower: boolean; flowerSize: number;
  flowerHue: number; petalCount: number; depth: number;
}

function createBranch(p: p5, x: number, y: number, angle: number, depth: number): Branch {
  const length = p.random(30, 60) * Math.pow(0.72, depth);
  return {
    x, y, angle, length,
    thickness: p.max(1.2, 4 - depth * 0.8),
    growProgress: 0, growSpeed: p.random(0.004, 0.012),
    children: [], hasFlower: depth >= 2 && p.random() > 0.3,
    flowerSize: p.random(4, 10),
    flowerHue: p.random(300, 380) % 360,
    petalCount: p.floor(p.random(4, 8)), depth,
  };
}

function growBranch(p: p5, branch: Branch, maxDepth: number) {
  if (branch.growProgress < 1) branch.growProgress = p.min(1, branch.growProgress + branch.growSpeed);
  if (branch.growProgress >= 1 && branch.children.length === 0 && branch.depth < maxDepth) {
    const num = branch.depth < 2 ? p.floor(p.random(2, 4)) : p.floor(p.random(1, 3));
    for (let i = 0; i < num; i++) {
      const endX = branch.x + p.cos(branch.angle) * branch.length;
      const endY = branch.y + p.sin(branch.angle) * branch.length;
      branch.children.push(createBranch(p, endX, endY, branch.angle + p.random(-0.7, 0.7), branch.depth + 1));
    }
  }
  for (const c of branch.children) growBranch(p, c, maxDepth);
}

function drawBranch(p: p5, branch: Branch) {
  if (branch.growProgress <= 0) return;
  const prog = branch.growProgress;
  const ex = branch.x + p.cos(branch.angle) * branch.length * prog;
  const ey = branch.y + p.sin(branch.angle) * branch.length * prog;
  p.stroke(110, p.map(branch.depth, 0, 5, 50, 70), p.map(branch.depth, 0, 5, 30, 50), 200);
  p.strokeWeight(branch.thickness);
  p.line(branch.x, branch.y, ex, ey);
  for (const c of branch.children) drawBranch(p, c);
  if (branch.hasFlower && prog >= 1) {
    p.push(); p.translate(ex, ey); p.noStroke();
    for (let i = 0; i < branch.petalCount; i++) {
      const a = (p.TWO_PI / branch.petalCount) * i;
      p.fill(branch.flowerHue % 360, 65, 90, 180);
      p.ellipse(p.cos(a) * branch.flowerSize * 0.55, p.sin(a) * branch.flowerSize * 0.55, branch.flowerSize, branch.flowerSize * 0.6);
    }
    p.fill(45, 75, 70, 220);
    p.circle(0, 0, branch.flowerSize * 0.35);
    p.pop();
  }
}

function initBranches(p: p5, w: number, h: number): Branch[] {
  const branches: Branch[] = [];
  const count = p.floor(p.random(2, 5));
  for (let i = 0; i < count; i++) {
    const left = p.random() > 0.5;
    const x = left ? 0 : w;
    const y = h * p.random(0.4, 1.0);
    const angle = left ? p.random(-0.3, -1.3) : p.random(-1.8, -2.8);
    branches.push(createBranch(p, x, y, angle, 0));
  }
  if (p.random() > 0.4) {
    const n = p.floor(p.random(1, 3));
    for (let i = 0; i < n; i++) {
      const x = p.random() > 0.5 ? p.random(0, w * 0.1) : p.random(w * 0.9, w);
      branches.push(createBranch(p, x, h, -p.HALF_PI + p.random(-0.4, 0.4), 0));
    }
  }
  return branches;
}

// ===== Element 2: Vine tendrils =====

interface Vine {
  points: { x: number; y: number }[];
  side: 'left' | 'right';
  growIndex: number; growTimer: number; growInterval: number;
  leaves: { x: number; y: number; size: number; angle: number; hue: number }[];
}

function initVines(p: p5, w: number, h: number): Vine[] {
  const vines: Vine[] = [];
  const count = p.floor(p.random(3, 6));
  for (let i = 0; i < count; i++) {
    const side: 'left' | 'right' = p.random() > 0.5 ? 'left' : 'right';
    const x = side === 'left' ? 0 : w;
    const pts: { x: number; y: number }[] = [];
    let cx = x, cy = h + p.random(0, 30);
    const segs = p.floor(p.random(14, 28));
    for (let j = 0; j < segs; j++) {
      pts.push({ x: cx, y: cy });
      cx += side === 'left' ? p.random(-3, 18) : p.random(-18, 3);
      if (side === 'left') cx = p.min(cx, w * 0.15); else cx = p.max(cx, w * 0.85);
      cy -= p.random(15, 35);
    }
    vines.push({ points: pts, side, growIndex: 0, growTimer: 0, growInterval: p.random(2, 6), leaves: [] });
  }
  return vines;
}

function updateVine(p: p5, v: Vine) {
  if (v.growIndex >= v.points.length) return;
  v.growTimer++;
  if (v.growTimer >= v.growInterval) {
    v.growTimer = 0; v.growIndex++;
    if (v.growIndex > 2 && p.random() > 0.4) {
      const pt = v.points[v.growIndex - 1];
      v.leaves.push({ x: pt.x, y: pt.y, size: p.random(5, 12), angle: v.side === 'left' ? p.random(0.2, 0.8) : p.random(-0.8, -0.2), hue: p.random(85, 145) });
    }
  }
}

function drawVine(p: p5, v: Vine) {
  if (v.growIndex < 2) return;
  p.noFill(); p.stroke(120, 55, 40, 160); p.strokeWeight(2);
  p.beginShape();
  for (let i = 0; i < v.growIndex && i < v.points.length; i++) (p as any).curveVertex(v.points[i].x, v.points[i].y);
  p.endShape();
  p.noStroke();
  for (const lf of v.leaves) {
    p.push(); p.translate(lf.x, lf.y); p.rotate(lf.angle);
    p.fill(lf.hue, 55, 60, 150); p.ellipse(0, 0, lf.size, lf.size * 1.7);
    p.stroke(lf.hue, 40, 35, 100); p.strokeWeight(0.5); p.line(0, -lf.size * 0.7, 0, lf.size * 0.7);
    p.pop();
  }
}

// ===== Element 3: Dandelion seeds =====

interface Seed {
  x: number; y: number; size: number;
  driftX: number; driftY: number; phase: number; lineLen: number;
}

function initSeeds(p: p5, w: number, h: number): Seed[] {
  const seeds: Seed[] = [];
  for (let i = 0; i < p.floor(p.random(10, 20)); i++) {
    seeds.push({ x: p.random(w), y: p.random(h), size: p.random(2, 4), driftX: p.random(-0.2, 0.2), driftY: p.random(-0.35, -0.08), phase: p.random(p.TWO_PI), lineLen: p.random(8, 16) });
  }
  return seeds;
}

function updateSeed(p: p5, s: Seed) {
  s.x += s.driftX + p.sin(p.frameCount * 0.01 + s.phase) * 0.25;
  s.y += s.driftY;
  if (s.y < -20) { s.y = p.height + 20; s.x = p.random(p.width); }
  if (s.x < -20) s.x = p.width + 20;
  if (s.x > p.width + 20) s.x = -20;
}

function drawSeed(p: p5, s: Seed) {
  const sw = p.sin(p.frameCount * 0.015 + s.phase) * 0.4;
  const tx = s.x + p.sin(sw) * s.lineLen, ty = s.y - p.cos(sw) * s.lineLen;
  p.stroke(80, 25, 65, 90); p.strokeWeight(0.6); p.line(s.x, s.y, tx, ty);
  p.stroke(60, 15, 80, 60); p.strokeWeight(0.3);
  for (let i = 0; i < 5; i++) { const a = (p.TWO_PI / 5) * i + p.frameCount * 0.002; p.line(tx, ty, tx + p.cos(a) * s.size * 2, ty + p.sin(a) * s.size * 2); }
  p.noStroke(); p.fill(60, 20, 90, 100); p.circle(s.x, s.y, s.size);
}

// ===== Element 4: Falling petals =====

interface Petal {
  x: number; y: number; size: number; hue: number;
  speed: number; drift: number; phase: number; rotSpeed: number; rot: number;
}

function initPetals(p: p5, w: number, h: number): Petal[] {
  const petals: Petal[] = [];
  for (let i = 0; i < p.floor(p.random(12, 22)); i++) {
    petals.push({
      x: p.random(w), y: p.random(-h * 0.3, h),
      size: p.random(4, 9), hue: p.random(320, 370) % 360,
      speed: p.random(0.2, 0.6), drift: p.random(-0.3, 0.3),
      phase: p.random(p.TWO_PI), rotSpeed: p.random(-0.02, 0.02), rot: p.random(p.TWO_PI),
    });
  }
  return petals;
}

function updatePetal(p: p5, pt: Petal) {
  pt.y += pt.speed;
  pt.x += pt.drift + p.sin(p.frameCount * 0.02 + pt.phase) * 0.5;
  pt.rot += pt.rotSpeed;
  if (pt.y > p.height + 20) { pt.y = -20; pt.x = p.random(p.width); }
  if (pt.x < -20) pt.x = p.width + 20;
  if (pt.x > p.width + 20) pt.x = -20;
}

function drawPetal(p: p5, pt: Petal) {
  p.push(); p.translate(pt.x, pt.y); p.rotate(pt.rot); p.noStroke();
  p.fill(pt.hue, 50, 90, 130);
  p.ellipse(0, 0, pt.size, pt.size * 1.5);
  p.pop();
}

// ===== Element 5: Fern fronds (unfurling from edges) =====

interface Fern {
  x: number; y: number; side: 'left' | 'right';
  maxSegments: number; growProgress: number; growSpeed: number;
  curl: number; segLen: number; hue: number;
}

function initFerns(p: p5, w: number, h: number): Fern[] {
  const ferns: Fern[] = [];
  const count = p.floor(p.random(2, 5));
  for (let i = 0; i < count; i++) {
    const side: 'left' | 'right' = p.random() > 0.5 ? 'left' : 'right';
    ferns.push({
      x: side === 'left' ? 0 : w,
      y: h * p.random(0.3, 0.9),
      side, maxSegments: p.floor(p.random(12, 22)),
      growProgress: 0, growSpeed: p.random(0.003, 0.008),
      curl: p.random(0.08, 0.18),
      segLen: p.random(8, 14),
      hue: p.random(100, 140),
    });
  }
  return ferns;
}

function updateFern(f: Fern) {
  if (f.growProgress < f.maxSegments) f.growProgress += f.growSpeed * 60;
}

function drawFern(p: p5, f: Fern) {
  const segsToShow = p.min(p.floor(f.growProgress), f.maxSegments);
  if (segsToShow < 1) return;
  let angle = f.side === 'left' ? -0.8 : -(p.PI - 0.8);
  let cx = f.x, cy = f.y;

  p.stroke(f.hue, 50, 40, 170); p.strokeWeight(2.5); p.noFill();
  for (let i = 0; i < segsToShow; i++) {
    const nx = cx + p.cos(angle) * f.segLen;
    const ny = cy + p.sin(angle) * f.segLen;
    p.line(cx, cy, nx, ny);

    // Small leaflets
    if (i > 1 && i % 2 === 0) {
      p.push();
      p.translate(nx, ny);
      const leafAngle = angle + (f.side === 'left' ? 0.6 : -0.6);
      p.stroke(f.hue, 45, 50, 130); p.strokeWeight(1);
      const ll = f.segLen * 0.6;
      p.line(0, 0, p.cos(leafAngle) * ll, p.sin(leafAngle) * ll);
      const leafAngle2 = angle + (f.side === 'left' ? -0.6 : 0.6);
      p.line(0, 0, p.cos(leafAngle2) * ll, p.sin(leafAngle2) * ll);
      // Tiny leaf tip
      p.noStroke(); p.fill(f.hue, 50, 55, 120);
      p.circle(p.cos(leafAngle) * ll, p.sin(leafAngle) * ll, 3);
      p.circle(p.cos(leafAngle2) * ll, p.sin(leafAngle2) * ll, 3);
      p.pop();
    }

    angle += f.side === 'left' ? -f.curl : f.curl;
    cx = nx; cy = ny;
  }

  // Curled tip
  if (f.growProgress < f.maxSegments) {
    p.noFill(); p.stroke(f.hue, 45, 45, 100); p.strokeWeight(1.5);
    p.arc(cx, cy, f.segLen * 0.8, f.segLen * 0.8, angle, angle + (f.side === 'left' ? -1.5 : 1.5));
  }
}

// ===== Element 6: Bottom flower border =====

interface BorderFlower {
  x: number; y: number; size: number; hue: number;
  petalCount: number; stemH: number; swayPhase: number;
  bloomProgress: number; bloomSpeed: number;
}

function initBorderFlowers(p: p5, w: number, h: number): BorderFlower[] {
  const flowers: BorderFlower[] = [];
  const count = p.floor(p.random(5, 12));
  const spacing = w / (count + 1);
  for (let i = 0; i < count; i++) {
    // Place along bottom, mostly near edges
    let x = spacing * (i + 1);
    // Push toward edges
    if (x > w * 0.25 && x < w * 0.75) {
      x = p.random() > 0.5 ? p.random(0, w * 0.2) : p.random(w * 0.8, w);
    }
    flowers.push({
      x, y: h,
      size: p.random(5, 12), hue: p.random(0, 60),
      petalCount: p.floor(p.random(5, 9)),
      stemH: p.random(30, 80),
      swayPhase: p.random(p.TWO_PI),
      bloomProgress: 0, bloomSpeed: p.random(0.005, 0.015),
    });
  }
  return flowers;
}

function updateBorderFlower(f: BorderFlower) {
  if (f.bloomProgress < 1) f.bloomProgress = Math.min(1, f.bloomProgress + f.bloomSpeed);
}

function drawBorderFlower(p: p5, f: BorderFlower) {
  const sway = p.sin(p.frameCount * 0.01 + f.swayPhase) * 3;
  const topX = f.x + sway;
  const topY = f.y - f.stemH * f.bloomProgress;

  // Stem
  p.stroke(120, 55, 40, 170); p.strokeWeight(1.5); p.noFill();
  p.bezier(f.x, f.y, f.x, f.y - f.stemH * 0.3, topX, topY + f.stemH * 0.3, topX, topY);

  // Leaves on stem
  if (f.bloomProgress > 0.4) {
    const lx = p.lerp(f.x, topX, 0.4);
    const ly = p.lerp(f.y, topY, 0.4);
    p.noStroke(); p.fill(110, 50, 50, 130);
    p.push(); p.translate(lx, ly); p.rotate(0.3);
    p.ellipse(6, 0, 8, 4);
    p.pop();
    p.push(); p.translate(lx, ly); p.rotate(-0.3);
    p.ellipse(-6, 0, 8, 4);
    p.pop();
  }

  // Flower head
  if (f.bloomProgress > 0.6) {
    const bloom = p.map(f.bloomProgress, 0.6, 1, 0, 1);
    p.push(); p.translate(topX, topY); p.noStroke();
    for (let i = 0; i < f.petalCount; i++) {
      const a = (p.TWO_PI / f.petalCount) * i;
      const r = f.size * 0.5 * bloom;
      p.fill(f.hue, 60, 90, 170);
      p.ellipse(p.cos(a) * r, p.sin(a) * r, f.size * bloom, f.size * 0.55 * bloom);
    }
    p.fill(40, 80, 75, 200);
    p.circle(0, 0, f.size * 0.3 * bloom);
    p.pop();
  }
}

// ===== Combination system =====

// 6 elements, each page picks 2-3 based on seed hash
const ELEMENT_NAMES = ['branches', 'vines', 'seeds', 'petals', 'ferns', 'flowers'] as const;
type ElementName = typeof ELEMENT_NAMES[number];

// Predefined combos for nice variety
const COMBOS: ElementName[][] = [
  ['branches', 'seeds'],
  ['vines', 'petals'],
  ['ferns', 'seeds'],
  ['branches', 'petals', 'flowers'],
  ['vines', 'ferns'],
  ['flowers', 'seeds', 'petals'],
  ['branches', 'vines', 'seeds'],
  ['ferns', 'flowers', 'petals'],
  ['vines', 'seeds', 'flowers'],
  ['branches', 'ferns'],
];

export function createPlantsSketch(seed: string) {
  return function plantsSketch(p: p5) {
    const h = hashSeed(seed);
    const combo = COMBOS[h % COMBOS.length];
    const has = (name: ElementName) => combo.includes(name);

    const state = {
      branches: [] as Branch[],
      vines: [] as Vine[],
      seeds: [] as Seed[],
      petals: [] as Petal[],
      ferns: [] as Fern[],
      borderFlowers: [] as BorderFlower[],
    };

    p.setup = () => {
      const parent = (p as any).canvas?.parentElement;
      const w = parent ? parent.offsetWidth : 800;
      const ht = parent ? parent.offsetHeight : 600;
      p.createCanvas(w, ht);
      p.colorMode(p.HSB, 360, 100, 100, 255);

      if (has('branches')) state.branches = initBranches(p, w, ht);
      if (has('vines')) state.vines = initVines(p, w, ht);
      if (has('seeds')) state.seeds = initSeeds(p, w, ht);
      if (has('petals')) state.petals = initPetals(p, w, ht);
      if (has('ferns')) state.ferns = initFerns(p, w, ht);
      if (has('flowers')) state.borderFlowers = initBorderFlowers(p, w, ht);
    };

    p.draw = () => {
      p.clear();

      for (const b of state.branches) { growBranch(p, b, 4); drawBranch(p, b); }
      for (const v of state.vines) { updateVine(p, v); drawVine(p, v); }
      for (const f of state.ferns) { updateFern(f); drawFern(p, f); }
      for (const f of state.borderFlowers) { updateBorderFlower(f); drawBorderFlower(p, f); }
      for (const s of state.seeds) { updateSeed(p, s); drawSeed(p, s); }
      for (const pt of state.petals) { updatePetal(p, pt); drawPetal(p, pt); }
    };

    p.windowResized = () => {
      const parent = (p as any).canvas?.parentElement;
      if (parent) p.resizeCanvas(parent.offsetWidth, parent.offsetHeight);
    };
  };
}
