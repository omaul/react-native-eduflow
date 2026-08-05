import React from 'react';
import { Link } from 'react-router-dom';
import { useCatalog } from '../hooks/useCatalog';
import { SubstrateComponent } from '../types/catalog';
import { ActiveFilters, applyFilters, countActiveFilters, searchItems, toggleFilter } from '../utils/catalog';
import {
  COMPONENT_FILTERS,
  LEVEL_LABELS,
  ROLE_LABELS,
  THERMAL_LABELS,
  componentHaystack,
} from '../utils/catalogLabels';
import CatalogControls from '../components/CatalogControls';
import { ArrowLeftIcon } from '../components/Icons';
import s from '../styles/shared.module.css';
import c from '../styles/catalog.module.css';

export default function ComponentLibrary() {
  const { items, error } = useCatalog<SubstrateComponent>('components/catalog.json');
  const [query, setQuery] = React.useState('');
  const [active, setActive] = React.useState<ActiveFilters>({});

  if (error)
    return (
      <div className={s.container}>
        <div className={s.errorBlock}>
          <p>Не удалось загрузить справочник компонентов</p>
          <button className={s.retryButton} onClick={() => window.location.reload()}>
            Попробовать снова
          </button>
        </div>
      </div>
    );

  if (!items)
    return (
      <div className={s.container}>
        <div className={s.skeleton}>
          <div className={s.skeletonLine} />
          <div className={s.skeletonLine} />
          <div className={s.skeletonLine} />
          <div className={s.skeletonLine} />
        </div>
      </div>
    );

  const activeCount = countActiveFilters(active);
  const visible = applyFilters(
    searchItems(items, query, componentHaystack),
    COMPONENT_FILTERS,
    active
  );

  function reset() {
    setActive({});
    setQuery('');
  }

  return (
    <div className={s.container}>
      <div className={s.back}>
        <Link to="/">
          <ArrowLeftIcon />
          На главную
        </Link>
      </div>

      <h1 className={s.title}>Компоненты субстрата</h1>
      <p className={c.intro}>
        Из чего собирают смеси. У каждого компонента — своя роль, кислотность и одно неочевидное
        свойство: холодный он или нет.
      </p>

      <CatalogControls
        specs={COMPONENT_FILTERS}
        active={active}
        onToggle={(key, value) => setActive((prev) => toggleFilter(prev, key, value))}
        onReset={reset}
        query={query}
        onQueryChange={setQuery}
        placeholder="Название компонента"
        activeCount={activeCount}
      />

      <p className={c.count}>
        {visible.length === items.length
          ? `Всего ${items.length}`
          : `Найдено ${visible.length} из ${items.length}`}
      </p>

      {visible.length === 0 ? (
        <div className={c.empty}>
          <p>Ничего не нашлось.</p>
          <button type="button" className={s.retryButton} onClick={reset}>
            Сбросить фильтры
          </button>
        </div>
      ) : (
        <ul className={c.grid}>
          {visible.map((component) => (
            <li key={component.id}>
              <Link to={`/components/${component.id}`} className={c.card}>
                <span className={c.cardName}>{component.name}</span>
                <span className={c.cardSummary}>{component.summary}</span>
                <span className={c.cardFooter}>
                  {component.roles.map((role) => (
                    <span key={role} className={c.badge}>
                      {ROLE_LABELS[role]}
                    </span>
                  ))}
                  {component.thermal === 'cold' && (
                    <span className={`${c.badge} ${c.badgeWarn}`}>
                      {THERMAL_LABELS[component.thermal]}
                    </span>
                  )}
                  <span className={c.badge}>Влага: {LEVEL_LABELS[component.moisture]}</span>
                  {!component.recommended && (
                    <span className={`${c.badge} ${c.badgeDanger}`}>Не советую</span>
                  )}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
