/**
 * Template for creating a new p5.js theme sketch.
 *
 * Usage:
 *   1. Copy this file to src/sketches/<theme-name>.ts
 *   2. Rename the export function to createYourThemeSketch
 *   3. Implement setup/draw logic
 *   4. Register in src/sketches/index.ts
 *
 * IMPORTANT:
 *   - This is p5 INSTANCE mode — all calls go through `p.*`
 *   - Canvas must be transparent (use p.clear(), not p.background())
 *   - Keep visuals subtle — this is a background behind readable content
 *   - Focus elements on edges, leave center clear
 */

import p5 from 'p5';

// Deterministic hash from string seed
function hashSeed(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

// Define interfaces for your state objects
interface Particle {
  x: number;
  y: number;
  // add properties as needed
}

export function createThemeSketch(seed: string) {
  return function themeSketch(p: p5) {
    const h = hashSeed(seed);

    // Mutable state — initialized in setup
    const state = {
      particles: [] as Particle[],
    };

    p.setup = () => {
      const parent = (p as any).canvas?.parentElement;
      const w = parent ? parent.offsetWidth : 800;
      const ht = parent ? parent.offsetHeight : 600;
      p.createCanvas(w, ht);
      p.colorMode(p.HSB, 360, 100, 100, 255);

      // Use seed for reproducibility
      p.randomSeed(h);
      p.noiseSeed(h);

      // Initialize your generative system here
    };

    p.draw = () => {
      p.clear(); // Transparent — content shows through

      // Update and draw your system here
    };

    p.windowResized = () => {
      const parent = (p as any).canvas?.parentElement;
      if (parent) p.resizeCanvas(parent.offsetWidth, parent.offsetHeight);
    };
  };
}
