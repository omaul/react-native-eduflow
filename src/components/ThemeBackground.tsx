import { useRef, useEffect } from 'react';
import { getSketch } from '../sketches';

interface ThemeBackgroundProps {
  theme: string;
  seed?: string;
}

declare const p5: any;

export default function ThemeBackground({ theme, seed = '' }: ThemeBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<any>(null);

  useEffect(() => {
    const sketchFn = getSketch(theme, seed);
    if (!sketchFn || !containerRef.current || typeof p5 === 'undefined') return;

    instanceRef.current = new p5(sketchFn, containerRef.current);

    return () => {
      if (instanceRef.current) {
        instanceRef.current.remove();
        instanceRef.current = null;
      }
    };
  }, [theme, seed]);

  return <div ref={containerRef} className="ThemeBackground" />;
}
