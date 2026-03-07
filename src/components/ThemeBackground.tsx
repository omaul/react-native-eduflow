import { useRef, useEffect } from 'react';
import p5 from 'p5';
import { getSketch } from '../sketches';
import styles from './ThemeBackground.module.css';

interface ThemeBackgroundProps {
  theme: string;
  seed?: string;
}

export default function ThemeBackground({ theme, seed = '' }: ThemeBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<p5 | null>(null);

  useEffect(() => {
    if (!containerRef.current || typeof p5 === 'undefined') return;
    const sketchFn = getSketch(theme, seed, containerRef.current);
    if (!sketchFn) return;

    instanceRef.current = new p5(sketchFn, containerRef.current);

    return () => {
      if (instanceRef.current) {
        instanceRef.current.remove();
        instanceRef.current = null;
      }
    };
  }, [theme, seed]);

  return <div ref={containerRef} className={styles.themeBackground} />;
}
