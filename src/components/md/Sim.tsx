import { MdDirectiveProps } from './registry';
import { sims } from './sims/registry';
import s from './Sim.module.css';

/**
 * Host for interactive simulations: `<sim name="sponge-jar" />`
 *
 * The caption (label) and the markdown body, if present, are shown under the
 * canvas — so a simulation can carry its own explanation.
 */
export default function Sim({ label, attrs, children }: MdDirectiveProps) {
  const name = attrs.name;
  const Simulation = name ? sims[name] : undefined;

  if (!Simulation) {
    return (
      <p className={s.missing}>
        Симуляция {name ? `«${name}»` : ''} не найдена. Доступные: {Object.keys(sims).join(', ')}.
      </p>
    );
  }

  return (
    <figure className={s.sim}>
      <Simulation />
      {(label || children) && (
        <figcaption className={s.caption}>
          {label && <span className={s.captionTitle}>{label}</span>}
          {children}
        </figcaption>
      )}
    </figure>
  );
}
