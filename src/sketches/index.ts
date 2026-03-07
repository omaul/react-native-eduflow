import p5 from 'p5';
import { createPlantsSketch } from './plants';
import { createWaterSketch } from './water';

type SketchFn = (p: p5) => void;

type SketchFactory = (seed: string, container: HTMLElement) => SketchFn;

const themes: Record<string, SketchFactory> = {
  plants: createPlantsSketch,
  water: createWaterSketch,
};

export function getSketch(theme: string, seed: string, container: HTMLElement): SketchFn | null {
  const factory = themes[theme];
  return factory ? factory(seed, container) : null;
}
