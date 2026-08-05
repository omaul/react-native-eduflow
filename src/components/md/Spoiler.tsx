import { ChevronDownIcon } from '../Icons';
import { MdDirectiveProps } from './registry';
import s from './Spoiler.module.css';

/**
 * Built on native <details> so keyboard and screen-reader support come for free.
 */
export default function Spoiler({ label, children }: MdDirectiveProps) {
  return (
    <details className={s.spoiler}>
      <summary className={s.summary}>
        <ChevronDownIcon className={s.chevron} />
        <span>{label || 'Показать'}</span>
      </summary>
      <div className={s.body}>{children}</div>
    </details>
  );
}
