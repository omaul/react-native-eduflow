import { ActiveFilters, FilterSpec } from '../utils/catalog';
import { SearchIcon, CloseIcon } from './Icons';
import s from './CatalogControls.module.css';

interface CatalogControlsProps<T> {
  specs: FilterSpec<T>[];
  active: ActiveFilters;
  onToggle: (key: string, value: string) => void;
  onReset: () => void;
  query: string;
  onQueryChange: (query: string) => void;
  placeholder?: string;
  activeCount: number;
}

export default function CatalogControls<T>({
  specs,
  active,
  onToggle,
  onReset,
  query,
  onQueryChange,
  placeholder = 'Поиск',
  activeCount,
}: CatalogControlsProps<T>) {
  return (
    <div className={s.controls}>
      <div className={s.searchRow}>
        <label className={s.search}>
          <SearchIcon className={s.searchIcon} />
          <span className={s.visuallyHidden}>{placeholder}</span>
          <input
            type="search"
            className={s.input}
            value={query}
            placeholder={placeholder}
            onChange={(event) => onQueryChange(event.target.value)}
          />
        </label>

        {(activeCount > 0 || query) && (
          <button type="button" className={s.reset} onClick={onReset}>
            <CloseIcon className={s.resetIcon} />
            Сбросить
            {activeCount > 0 ? ` (${activeCount})` : ''}
          </button>
        )}
      </div>

      {specs.map((spec) => (
        <div key={spec.key} className={s.group}>
          <span className={s.groupLabel} id={`filter-${spec.key}`}>
            {spec.label}
          </span>
          <div className={s.chips} role="group" aria-labelledby={`filter-${spec.key}`}>
            {spec.options.map((option) => {
              const selected = active[spec.key]?.includes(option.value) ?? false;
              return (
                <button
                  key={option.value}
                  type="button"
                  className={s.chip}
                  aria-pressed={selected}
                  onClick={() => onToggle(spec.key, option.value)}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
