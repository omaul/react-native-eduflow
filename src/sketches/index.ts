import p5 from '../types/p5-global';
import { createPlantsSketch } from './plants';

type SketchFn = (p: p5) => void;

type SketchFactory = (seed: string) => SketchFn;

const themes: Record<string, SketchFactory> = {
  plants: createPlantsSketch,
};

export function getSketch(theme: string, seed: string): SketchFn | null {
  const factory = themes[theme];
  return factory ? factory(seed) : null;
}
