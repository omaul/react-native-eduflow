import React from 'react';
import { Link } from 'react-router-dom';
import { useCatalog } from '../hooks/useCatalog';
import { Plant } from '../types/catalog';
import { ActiveFilters, applyFilters, countActiveFilters, searchItems, toggleFilter } from '../utils/catalog';
import {
  DIFFICULTY_LABELS,
  LIGHT_LABELS,
  PLANT_FILTERS,
  RARITY_LABELS,
  WATER_LABELS,
  plantHaystack,
} from '../utils/catalogLabels';
import CatalogControls from '../components/CatalogControls';
import PlantPortrait from '../components/PlantPortrait';
import ThemeBackground from '../components/ThemeBackground';
import { ArrowLeftIcon } from '../components/Icons';
import s from '../styles/shared.module.css';
import c from '../styles/catalog.module.css';

export default function PlantLibrary() {
  const { items, error } = useCatalog<Plant>('species/catalog.json');
  const [query, setQuery] = React.useState('');
  const [active, setActive] = React.useState<ActiveFilters>({});

  if (error)
    return (
      <div className={s.container}>
        <div className={s.errorBlock}>
          <p>Не удалось загрузить каталог растений</p>
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
  const visible = applyFilters(searchItems(items, query, plantHaystack), PLANT_FILTERS, active);

  function reset() {
    setActive({});
    setQuery('');
  }

  return (
    <div
      className={`${s.container} ${s.themedPage}`}
      style={{ '--theme-accent': '#4a7c59' } as React.CSSProperties}
    >
      <ThemeBackground theme="plants" seed="plant-library" />
      <div className={s.themedPageContent}>
        <div className={s.back}>
          <Link to="/">
            <ArrowLeftIcon />
            На главную
          </Link>
        </div>

        <h1 className={s.title}>Библиотека растений</h1>
        <p className={c.intro}>
          {items.length} видов — от устойчивых до требовательных. У каждого свои требования к субстрату:
          кому больше кокоса, кому только перлит без каменных разрыхлителей.
        </p>

        <CatalogControls
          specs={PLANT_FILTERS}
          active={active}
          onToggle={(key, value) => setActive((prev) => toggleFilter(prev, key, value))}
          onReset={reset}
          query={query}
          onQueryChange={setQuery}
          placeholder="Название или латынь"
          activeCount={activeCount}
        />

        <p className={c.count}>
          {visible.length === items.length
            ? `Всего ${items.length}`
            : `Найдено ${visible.length} из ${items.length}`}
        </p>

        {visible.length === 0 ? (
          <div className={c.empty}>
            <p>Под такие условия ничего не нашлось.</p>
            <button type="button" className={s.retryButton} onClick={reset}>
              Сбросить фильтры
            </button>
          </div>
        ) : (
          <ul className={c.grid}>
            {visible.map((plant) => (
              <li key={plant.id}>
                <Link to={`/plants/${plant.id}`} className={c.card}>
                  {plant.visual && (
                    <span className={c.cardPortrait}>
                      <PlantPortrait visual={plant.visual} seed={plant.id} />
                    </span>
                  )}
                  <span className={c.cardName}>{plant.name}</span>
                  <span className={c.cardLatin}>{plant.latin}</span>
                  <span className={c.cardSummary}>{plant.summary}</span>
                  <span className={c.cardFooter}>
                    <span className={c.badge}>{DIFFICULTY_LABELS[plant.difficulty]}</span>
                    <span className={c.badge}>{LIGHT_LABELS[plant.light]}</span>
                    <span className={c.badge}>{WATER_LABELS[plant.water]}</span>
                    {plant.rarity !== 'common' && (
                      <span className={c.badge}>{RARITY_LABELS[plant.rarity]}</span>
                    )}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
