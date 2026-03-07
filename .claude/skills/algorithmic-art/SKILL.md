---
name: algorithmic-art
description: Creating algorithmic art themes for the app using p5.js in instance mode with TypeScript. Use this when users request creating art using code, generative art, algorithmic art, flow fields, particle systems, or new visual themes for note pages.
---

Algorithmic art themes are p5.js sketches integrated into the React app as background decorations for note pages. Each theme is a TypeScript module in `src/sketches/` that exports a factory function.

This happens in two steps:
1. Algorithmic Philosophy Creation (think through the vision)
2. Express by creating a p5.js sketch as a TypeScript module

## ALGORITHMIC PHILOSOPHY CREATION

Before writing code, articulate the computational aesthetic:

**Name the movement** (1-2 words): "Organic Turbulence" / "Quantum Harmonics" / "Emergent Stillness"

**Articulate the philosophy** (2-4 paragraphs) describing how it manifests through:
- Computational processes and mathematical relationships
- Noise functions and randomness patterns
- Particle behaviors and field dynamics
- Temporal evolution and system states

### ESSENTIAL PRINCIPLES
- **PROCESS OVER PRODUCT**: Beauty emerges from the algorithm's execution — each run is unique
- **PARAMETRIC EXPRESSION**: Ideas communicate through mathematical relationships, forces, behaviors — not static composition
- **PURE GENERATIVE ART**: Living algorithms, not static images with randomness
- **EXPERT CRAFTSMANSHIP**: The algorithm should feel meticulously crafted, refined through deep expertise

---

## IMPLEMENTATION — PROJECT ARCHITECTURE

**CRITICAL**: This project uses p5.js in **instance mode** with **TypeScript**. NOT global mode. NOT standalone HTML.

### Project structure

```
src/sketches/
├── index.ts          — Theme registry (getSketch, SketchFn, SketchFactory)
├── plants.ts         — Example: plants theme
└── <new-theme>.ts    — New themes go here
src/components/
└── ThemeBackground.tsx — React component that mounts p5 instance
public/content/
└── index.json         — Note/folder metadata (theme field per folder)
```

### How themes work

1. Each folder in `public/content/index.json` can have a `"theme": "plants"` field
2. `ThemeBackground.tsx` reads the theme name and calls `getSketch(theme, seed)`
3. `src/sketches/index.ts` maps theme names to factory functions
4. The factory receives a seed string and returns a p5 sketch function

### INSTANCE MODE — CRITICAL DIFFERENCE

All p5 methods are called on the `p` instance, NOT as globals:

```typescript
// ✅ CORRECT — instance mode
export function createMySketch(seed: string) {
  return function mySketch(p: p5) {
    p.setup = () => {
      const parent = (p as any).canvas?.parentElement;
      const w = parent ? parent.offsetWidth : 800;
      const h = parent ? parent.offsetHeight : 600;
      p.createCanvas(w, h);
      p.colorMode(p.HSB, 360, 100, 100, 255);
      // initialize state here
    };

    p.draw = () => {
      p.clear(); // transparent background — this is an overlay
      // draw here
    };

    p.windowResized = () => {
      const parent = (p as any).canvas?.parentElement;
      if (parent) p.resizeCanvas(parent.offsetWidth, parent.offsetHeight);
    };
  };
}
```

```typescript
// ❌ WRONG — global mode (DO NOT USE)
function setup() { createCanvas(800, 800); }
function draw() { background(255); }
```

### Seed handling

Seeds are **strings** (the note slug). Convert to a numeric hash for `p.randomSeed()`:

```typescript
function hashSeed(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}
```

### Registering a new theme

In `src/sketches/index.ts`, add the import and register in the `themes` map:

```typescript
import { createMySketch } from './my-theme';

const themes: Record<string, SketchFactory> = {
  plants: createPlantsSketch,
  'my-theme': createMySketch,  // add here
};
```

Then set `"theme": "my-theme"` on a folder in `public/content/index.json`.

### Visual constraints

- The sketch renders as a **background layer** behind content (CSS class `ThemeBackground`)
- Use `p.clear()` each frame — the canvas must be **transparent** so text is readable
- Keep visuals **subtle and non-distracting** — soft colors, low opacity, edge-focused
- Elements should grow from **edges** (left/right/bottom), leaving the center clear for reading
- Canvas auto-sizes to the parent container, handle `windowResized`

### TypeScript

- Import p5: `import p5 from 'p5';`
- Type the sketch parameter as `p: p5`
- Use `(p as any)` for methods missing from `@types/p5` (e.g., `curveVertex`)
- Define interfaces for state objects (particles, branches, etc.)

---

## CRAFTSMANSHIP REQUIREMENTS

- **Balance**: Complexity without visual noise, order without rigidity
- **Color Harmony**: Use HSB color mode. Thoughtful palettes, not random values
- **Performance**: Smooth 60fps. Optimize for real-time animation
- **Subtlety**: This is a background decoration, not the main attraction
- **Reproducibility**: Same seed string always produces the same visual

---

## CREATIVE PROCESS

**User request** → **Algorithmic philosophy** → **TypeScript module** → **Register in index.ts**

1. Interpret the user's intent — what aesthetic is being sought?
2. Create an algorithmic philosophy (2-4 paragraphs)
3. Implement as a TypeScript module in `src/sketches/`
4. Register in `src/sketches/index.ts`
5. Assign to folders in `public/content/index.json`

Use `src/sketches/plants.ts` as the reference implementation for code structure, patterns, and conventions.
