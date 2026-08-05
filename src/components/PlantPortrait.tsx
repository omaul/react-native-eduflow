import React from 'react';
import { PlantVisual } from '../types/catalog';
import { buildPortrait } from '../utils/plantPortrait';
import s from './PlantPortrait.module.css';

interface PlantPortraitProps {
  visual: PlantVisual;
  /** Used as the random seed, so a plant always looks the same */
  seed: string;
  /** Accessible description; the portrait is decorative when omitted */
  label?: string;
  /** Gentle sway. Cards stay static — dozens of animated portraits are wasteful */
  animated?: boolean;
  className?: string;
}

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = React.useState(false);

  React.useEffect(() => {
    if (!window.matchMedia) return;
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(query.matches);
    const handler = (event: MediaQueryListEvent) => setReduced(event.matches);
    query.addEventListener('change', handler);
    return () => query.removeEventListener('change', handler);
  }, []);

  return reduced;
}

export default function PlantPortrait({
  visual,
  seed,
  label,
  animated = false,
  className,
}: PlantPortraitProps) {
  const reducedMotion = usePrefersReducedMotion();
  const portrait = React.useMemo(() => buildPortrait(visual, seed), [visual, seed]);
  const moves = animated && !reducedMotion;

  return (
    <svg
      className={`${s.portrait} ${s[visual.palette]} ${className ?? ''}`}
      viewBox={`0 0 ${portrait.size} ${portrait.size}`}
      role={label ? 'img' : 'presentation'}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {portrait.elements.map((element, index) => (
        <g key={index} transform={element.transform}>
          {element.kind === 'stem' ? (
            <path
              className={s.stem}
              d={element.d}
              fill="none"
              strokeWidth={element.kind === 'stem' ? 1.6 : 1}
            />
          ) : (
            <path className={`${s.leaf} ${s[`tone${element.tone}`]}`} d={element.d} />
          )}
          {moves && element.sway > 0 && (
            <animateTransform
              attributeName="transform"
              type="rotate"
              additive="sum"
              values={`${-element.sway};${element.sway};${-element.sway}`}
              dur={`${6 + (index % 5)}s`}
              begin={`${element.delay}s`}
              repeatCount="indefinite"
            />
          )}
        </g>
      ))}
    </svg>
  );
}
