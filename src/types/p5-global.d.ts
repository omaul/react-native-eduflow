declare class p5 {
  constructor(sketch: (p: p5) => void, node?: HTMLElement);
  remove(): void;

  // Canvas
  createCanvas(w: number, h: number): void;
  resizeCanvas(w: number, h: number): void;
  background(r: number, g?: number, b?: number, a?: number): void;
  clear(): void;

  // Drawing
  fill(r: number, g?: number, b?: number, a?: number): void;
  noFill(): void;
  stroke(r: number, g?: number, b?: number, a?: number): void;
  noStroke(): void;
  strokeWeight(w: number): void;
  ellipse(x: number, y: number, w: number, h?: number): void;
  circle(x: number, y: number, d: number): void;
  rect(x: number, y: number, w: number, h: number, tl?: number, tr?: number, br?: number, bl?: number): void;
  line(x1: number, y1: number, x2: number, y2: number): void;
  point(x: number, y: number): void;
  arc(x: number, y: number, w: number, h: number, start: number, stop: number, mode?: string): void;
  bezier(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number): void;
  beginShape(): void;
  endShape(mode?: string): void;
  vertex(x: number, y: number): void;
  curveVertex(x: number, y: number): void;

  // Transform
  push(): void;
  pop(): void;
  translate(x: number, y: number): void;
  rotate(angle: number): void;
  scale(s: number): void;

  // Math
  random(min?: number, max?: number): number;
  noise(x: number, y?: number, z?: number): number;
  map(value: number, start1: number, stop1: number, start2: number, stop2: number): number;
  lerp(start: number, stop: number, amt: number): number;
  sin(angle: number): number;
  cos(angle: number): number;
  floor(n: number): number;
  abs(n: number): number;
  min(a: number, b: number): number;
  max(a: number, b: number): number;
  constrain(n: number, low: number, high: number): number;

  // Color
  color(r: number, g?: number, b?: number, a?: number): object;
  lerpColor(c1: object, c2: object, amt: number): object;
  colorMode(mode: string, max1?: number, max2?: number, max3?: number, maxA?: number): void;

  // Constants
  PI: number;
  TWO_PI: number;
  HALF_PI: number;
  QUARTER_PI: number;
  CLOSE: string;
  HSB: string;
  RGB: string;

  // Environment
  width: number;
  height: number;
  frameCount: number;
  mouseX: number;
  mouseY: number;

  // Lifecycle (assigned by user)
  setup: () => void;
  draw: () => void;
  windowResized: () => void;
}

export default p5;
