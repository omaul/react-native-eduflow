import p5 from 'p5';

function hashSeed(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

// ===== Bubble =====

interface Bubble {
  x: number;
  y: number;
  size: number;
  speed: number;
  wobblePhase: number;
  wobbleAmp: number;
  opacity: number;
}

function createBubble(p: p5, w: number, h: number): Bubble {
  // Spawn near left/right edges
  const side = p.random() > 0.5;
  return {
    x: side ? p.random(0, w * 0.18) : p.random(w * 0.82, w),
    y: h + p.random(10, 80),
    size: p.random(3, 10),
    speed: p.random(0.4, 1.2),
    wobblePhase: p.random(p.TWO_PI),
    wobbleAmp: p.random(0.5, 1.8),
    opacity: p.random(60, 140),
  };
}

function updateBubble(p: p5, b: Bubble, w: number) {
  b.y -= b.speed;
  b.x += p.sin(p.frameCount * 0.02 + b.wobblePhase) * b.wobbleAmp;
  if (b.x < 0) b.x = w;
  if (b.x > w) b.x = 0;
}

function drawBubble(p: p5, b: Bubble) {
  p.noFill();
  p.stroke(195, 35, 95, b.opacity);
  p.strokeWeight(0.7);
  p.circle(b.x, b.y, b.size);
  // highlight
  p.noStroke();
  p.fill(190, 15, 100, b.opacity * 0.7);
  p.circle(b.x - b.size * 0.15, b.y - b.size * 0.15, b.size * 0.3);
}

// ===== Wave layer =====

interface WaveLayer {
  amplitude: number;
  frequency: number;
  speed: number;
  phase: number;
  yBase: number;
  yFraction: number; // store fraction for resize
  hue: number;
  saturation: number;
  brightness: number;
  alpha: number;
}

function createWaveLayers(p: p5, h: number): WaveLayer[] {
  return [
    // top wave — far background
    {
      amplitude: p.random(6, 10),
      frequency: p.random(0.006, 0.01),
      speed: p.random(0.003, 0.006),
      phase: p.random(p.TWO_PI),
      yBase: h * 0.35,
      yFraction: 0.35,
      hue: p.random(200, 220),
      saturation: 15,
      brightness: 85,
      alpha: 25,
    },
    // upper-mid wave
    {
      amplitude: p.random(8, 14),
      frequency: p.random(0.008, 0.012),
      speed: p.random(0.004, 0.008),
      phase: p.random(p.TWO_PI),
      yBase: h * 0.5,
      yFraction: 0.5,
      hue: p.random(195, 215),
      saturation: 20,
      brightness: 80,
      alpha: 30,
    },
    // mid wave
    {
      amplitude: p.random(10, 18),
      frequency: p.random(0.01, 0.015),
      speed: p.random(0.006, 0.012),
      phase: p.random(p.TWO_PI),
      yBase: h * 0.65,
      yFraction: 0.65,
      hue: p.random(190, 210),
      saturation: 28,
      brightness: 75,
      alpha: 40,
    },
    // lower wave
    {
      amplitude: p.random(8, 14),
      frequency: p.random(0.012, 0.02),
      speed: p.random(0.008, 0.015),
      phase: p.random(p.TWO_PI),
      yBase: h * 0.8,
      yFraction: 0.8,
      hue: p.random(185, 205),
      saturation: 35,
      brightness: 70,
      alpha: 50,
    },
    // bottom wave — surface
    {
      amplitude: p.random(5, 10),
      frequency: p.random(0.018, 0.028),
      speed: p.random(0.012, 0.022),
      phase: p.random(p.TWO_PI),
      yBase: h * 0.92,
      yFraction: 0.92,
      hue: p.random(180, 200),
      saturation: 25,
      brightness: 85,
      alpha: 35,
    },
  ];
}

function drawWave(p: p5, layer: WaveLayer, w: number, h: number) {
  p.noStroke();
  p.fill(layer.hue, layer.saturation, layer.brightness, layer.alpha);
  p.beginShape();
  const t = p.frameCount * layer.speed + layer.phase;
  for (let x = 0; x <= w; x += 4) {
    const y =
      layer.yBase +
      p.sin(x * layer.frequency + t) * layer.amplitude +
      p.sin(x * layer.frequency * 1.7 + t * 1.3) * layer.amplitude * 0.4 +
      p.sin(x * layer.frequency * 0.5 + t * 0.7) * layer.amplitude * 0.25;
    p.vertex(x, y);
  }
  p.vertex(w, h);
  p.vertex(0, h);
  p.endShape(p.CLOSE);
}

// ===== Caustic light patterns =====

interface CausticSpot {
  x: number;
  y: number;
  size: number;
  phase: number;
  speed: number;
  drift: number;
}

function createCaustics(p: p5, w: number, h: number): CausticSpot[] {
  const spots: CausticSpot[] = [];
  const count = p.floor(p.random(20, 35));
  for (let i = 0; i < count; i++) {
    const side = p.random() > 0.5;
    spots.push({
      x: side ? p.random(0, w * 0.2) : p.random(w * 0.8, w),
      y: p.random(h * 0.15, h),
      size: p.random(20, 60),
      phase: p.random(p.TWO_PI),
      speed: p.random(0.008, 0.025),
      drift: p.random(-0.15, 0.15),
    });
  }
  return spots;
}

function drawCaustic(p: p5, c: CausticSpot) {
  const pulse = p.sin(p.frameCount * c.speed + c.phase) * 0.35 + 0.65;
  const s = c.size * pulse;
  c.y += c.drift;
  // wrap vertically
  if (c.y < -c.size) c.y = p.height + c.size;
  if (c.y > p.height + c.size) c.y = -c.size;

  p.noStroke();
  p.fill(190, 18, 97, 22 * pulse);
  p.ellipse(c.x, c.y, s, s * 0.65);
  p.fill(195, 12, 100, 12 * pulse);
  p.ellipse(c.x, c.y, s * 1.5, s);
}

// ===== Flowing current lines along edges =====

interface CurrentLine {
  points: { x: number; y: number }[];
  side: 'left' | 'right';
  speed: number;
  phase: number;
  hue: number;
  alpha: number;
  thickness: number;
}

function createCurrentLines(p: p5, w: number, h: number): CurrentLine[] {
  const lines: CurrentLine[] = [];
  const count = p.floor(p.random(6, 12));
  for (let i = 0; i < count; i++) {
    const side: 'left' | 'right' = p.random() > 0.5 ? 'left' : 'right';
    const baseX = side === 'left' ? p.random(0, w * 0.12) : p.random(w * 0.88, w);
    const pts: { x: number; y: number }[] = [];
    const segments = p.floor(p.random(8, 16));
    for (let j = 0; j < segments; j++) {
      pts.push({
        x: baseX + p.random(-15, 15),
        y: (h / (segments - 1)) * j,
      });
    }
    lines.push({
      points: pts,
      side,
      speed: p.random(0.3, 0.8),
      phase: p.random(p.TWO_PI),
      hue: p.random(185, 210),
      alpha: p.random(30, 70),
      thickness: p.random(1, 2.5),
    });
  }
  return lines;
}

function drawCurrentLine(p: p5, cl: CurrentLine) {
  p.noFill();
  p.stroke(cl.hue, 30, 80, cl.alpha);
  p.strokeWeight(cl.thickness);
  p.beginShape();
  const t = p.frameCount * 0.015 + cl.phase;
  for (const pt of cl.points) {
    const offsetX = p.sin(pt.y * 0.008 + t) * 12;
    const offsetY = p.sin(pt.x * 0.01 + t * 1.3) * 4;
    p.splineVertex(pt.x + offsetX, pt.y + offsetY);
  }
  p.endShape();
}

// ===== Drifting particles (tiny specs in current) =====

interface Spec {
  x: number;
  y: number;
  speed: number;
  size: number;
  phase: number;
  opacity: number;
}

function createSpecs(p: p5, w: number, h: number): Spec[] {
  const specs: Spec[] = [];
  const count = p.floor(p.random(30, 50));
  for (let i = 0; i < count; i++) {
    const side = p.random() > 0.5;
    specs.push({
      x: side ? p.random(0, w * 0.15) : p.random(w * 0.85, w),
      y: p.random(0, h),
      speed: p.random(0.15, 0.5),
      size: p.random(1.5, 3.5),
      phase: p.random(p.TWO_PI),
      opacity: p.random(40, 100),
    });
  }
  return specs;
}

function updateSpec(p: p5, s: Spec, h: number) {
  s.y -= s.speed;
  s.x += p.sin(p.frameCount * 0.01 + s.phase) * 0.4;
  if (s.y < -10) {
    s.y = h + 10;
  }
}

function drawSpec(p: p5, s: Spec) {
  p.noStroke();
  p.fill(195, 20, 95, s.opacity);
  p.circle(s.x, s.y, s.size);
}

// ===== Main sketch =====

export function createWaterSketch(seed: string, container: HTMLElement) {
  return function waterSketch(p: p5) {
    const h = hashSeed(seed);

    const state = {
      bubbles: [] as Bubble[],
      waves: [] as WaveLayer[],
      caustics: [] as CausticSpot[],
      currents: [] as CurrentLine[],
      specs: [] as Spec[],
    };

    p.setup = () => {
      const w = container.offsetWidth || 800;
      const ht = container.offsetHeight || 600;
      p.createCanvas(w, ht);
      p.colorMode(p.HSB, 360, 100, 100, 255);
      p.randomSeed(h);
      p.noiseSeed(h);

      const bubbleCount = p.floor(p.random(25, 40));
      for (let i = 0; i < bubbleCount; i++) {
        const b = createBubble(p, w, ht);
        b.y = p.random(0, ht); // scatter across full height
        state.bubbles.push(b);
      }

      state.waves = createWaveLayers(p, ht);
      state.caustics = createCaustics(p, w, ht);
      state.currents = createCurrentLines(p, w, ht);
      state.specs = createSpecs(p, w, ht);
    };

    p.draw = () => {
      p.clear();

      // Current flow lines on edges
      for (const cl of state.currents) {
        drawCurrentLine(p, cl);
      }

      // Caustic light patterns
      for (const c of state.caustics) {
        drawCaustic(p, c);
      }

      // Wave layers (back to front)
      for (const layer of state.waves) {
        drawWave(p, layer, p.width, p.height);
      }

      // Drifting specs
      for (const s of state.specs) {
        updateSpec(p, s, p.height);
        drawSpec(p, s);
      }

      // Bubbles
      for (const b of state.bubbles) {
        updateBubble(p, b, p.width);
        drawBubble(p, b);
        if (b.y < -10) {
          const nb = createBubble(p, p.width, p.height);
          b.x = nb.x;
          b.y = nb.y;
          b.size = nb.size;
          b.speed = nb.speed;
          b.wobblePhase = nb.wobblePhase;
          b.wobbleAmp = nb.wobbleAmp;
          b.opacity = nb.opacity;
        }
      }
    };

    p.windowResized = () => {
      p.resizeCanvas(container.offsetWidth, container.offsetHeight);
      const ht = container.offsetHeight;
      for (const w of state.waves) {
        w.yBase = ht * w.yFraction;
      }
    };
  };
}
