import React from 'react';
import { PlantVisual } from '../types/catalog';
import { findPlantModel } from '../data/plants';
import { buildPortrait } from '../utils/plantPortrait';
import { renderPlant, Shape } from '../utils/plantRender';
import s from './PlantPortrait.module.css';

interface PlantPortraitProps {
  visual: PlantVisual;
  /** Plant id: picks the authored model if one exists, and seeds the fallback drawing */
  plantId: string;
  /** Age 0..1 for authored models. Ignored by the fallback, which has no growth stages. */
  age?: number;
  /** Veins and variegation. Off by default — invisible at card size and costly in a grid. */
  detail?: boolean;
  /** Accessible description; the portrait is decorative when omitted */
  label?: string;
  /** Gentle sway, fallback drawings only. Cards stay static. */
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

const ROLE_CLASS: Record<Shape['role'], string> = {
  blade: s.leaf,
  vein: s.vein,
  veinBright: s.veinBright,
  mark: s.mark,
  bloomPale: s.bloomPale,
  bloomWarm: s.bloomWarm,
  stem: s.stem,
  pot: s.pot,
  rim: s.rim,
  soil: s.soil,
};

/** An authored species model, drawn at the given age */
function ModelPortrait({
  visual,
  plantId,
  age,
  detail,
  label,
  className,
}: Required<Pick<PlantPortraitProps, 'visual' | 'plantId' | 'age' | 'detail'>> &
  Pick<PlantPortraitProps, 'label' | 'className'>) {
  const model = findPlantModel(plantId)!;
  // Two portraits of the same plant can share a page, so clip ids need a per-instance prefix
  const uid = React.useId().replace(/:/g, '');
  const render = React.useMemo(
    () => renderPlant(model, age, { detail, seed: plantId }),
    [model, age, detail, plantId]
  );

  const clips = render.groups
    .filter((group) => group.clip && group.shapes.some((shape) => shape.role === 'mark'))
    .map((group) => group.clip!);

  return (
    <svg
      className={`${s.portrait} ${s[visual.palette]} ${className ?? ''}`}
      viewBox={render.viewBox}
      role={label ? 'img' : 'presentation'}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {clips.length > 0 && (
        <defs>
          {clips.map((clip) => (
            <clipPath key={clip.id} id={`${uid}-${clip.id}`}>
              <path d={clip.d} />
            </clipPath>
          ))}
        </defs>
      )}
      <g transform={render.flip}>
        {render.groups.map((group, index) => (
          <g key={index} transform={group.transform}>
            {group.shapes.map((shape, i) => (
              <path
                key={i}
                className={[
                  ROLE_CLASS[shape.role],
                  shape.role === 'blade' ? s[`tone${shape.tone ?? 0}`] : '',
                  shape.evenOdd ? s.ring : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                d={shape.d}
                strokeWidth={shape.width}
                opacity={shape.opacity}
                clipPath={
                  shape.role === 'mark' && group.clip
                    ? `url(#${uid}-${group.clip.id})`
                    : undefined
                }
              />
            ))}
          </g>
        ))}
      </g>
    </svg>
  );
}

/** The generative drawing built from three traits — used for species not yet drawn by hand */
function GenerativePortrait({
  visual,
  plantId,
  label,
  animated,
  className,
}: Pick<PlantPortraitProps, 'visual' | 'plantId' | 'label' | 'animated' | 'className'>) {
  const reducedMotion = usePrefersReducedMotion();
  const portrait = React.useMemo(() => buildPortrait(visual, plantId), [visual, plantId]);
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
            <path className={s.stem} d={element.d} fill="none" strokeWidth={1.6} />
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

export default function PlantPortrait({
  visual,
  plantId,
  age = 1,
  detail = false,
  label,
  animated = false,
  className,
}: PlantPortraitProps) {
  if (findPlantModel(plantId)) {
    return (
      <ModelPortrait
        visual={visual}
        plantId={plantId}
        age={age}
        detail={detail}
        label={label}
        className={className}
      />
    );
  }

  return (
    <GenerativePortrait
      visual={visual}
      plantId={plantId}
      label={label}
      animated={animated}
      className={className}
    />
  );
}
