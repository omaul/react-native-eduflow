import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useCatalog } from '../hooks/useCatalog';
import { useMarkdown } from '../hooks/useMarkdown';
import { useNotes } from '../hooks/useNotes';
import { Plant, SubstrateAdvice, SubstrateComponent } from '../types/catalog';
import { DIFFICULTY_LABELS, PLANT_FIELDS, RARITY_LABELS } from '../utils/catalogLabels';
import MarkdownContent from '../components/md/MarkdownContent';
import PlantGrowth from '../components/PlantGrowth';
import PlantPortrait from '../components/PlantPortrait';
import { findPlantModel } from '../data/plants';
import ThemeBackground from '../components/ThemeBackground';
import { ArrowLeftIcon } from '../components/Icons';
import s from '../styles/shared.module.css';
import c from '../styles/catalog.module.css';

function AdviceList({
  advice,
  components,
  tone,
}: {
  advice: SubstrateAdvice[];
  components: SubstrateComponent[] | null;
  tone: 'good' | 'bad';
}) {
  return (
    <ul className={c.adviceList}>
      {advice.map((entry) => {
        const component = components?.find((item) => item.id === entry.component);
        const name = component?.name ?? entry.component;
        return (
          <li
            key={entry.component}
            className={`${c.advice} ${tone === 'good' ? c.adviceGood : c.adviceBad}`}
          >
            {component ? (
              <Link to={`/components/${component.id}`} className={c.adviceName}>
                {name}
              </Link>
            ) : (
              <span className={c.adviceName}>{name}</span>
            )}
            {entry.share && <span className={c.adviceShare}>{entry.share}</span>}
            {entry.why && <p className={c.adviceWhy}>{entry.why}</p>}
          </li>
        );
      })}
    </ul>
  );
}

export default function PlantDetail() {
  const { id } = useParams<{ id: string }>();
  const { items: plants, error } = useCatalog<Plant>('species/catalog.json');
  const { items: components } = useCatalog<SubstrateComponent>('components/catalog.json');
  const { notes } = useNotes();

  const plant = plants?.find((item) => item.id === id);
  const contentRoot = `${import.meta.env.BASE_URL}content/`;
  const candidates = React.useMemo(
    () => (plant?.article && id ? [`${contentRoot}species/${id}/index.md`] : []),
    [plant?.article, id, contentRoot]
  );
  const { md, basePath } = useMarkdown(candidates, contentRoot);

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

  if (!plants)
    return (
      <div className={s.container}>
        <div className={s.skeleton}>
          <div className={s.skeletonLine} />
          <div className={s.skeletonLine} />
          <div className={s.skeletonLine} />
        </div>
      </div>
    );

  if (!plant)
    return (
      <div className={s.container}>
        <div className={s.back}>
          <Link to="/plants">
            <ArrowLeftIcon />
            В библиотеку
          </Link>
        </div>
        <div className={c.empty}>
          <p>Такого растения в библиотеке пока нет.</p>
        </div>
      </div>
    );

  const model = findPlantModel(plant.id);

  const params = PLANT_FIELDS.map((field) => ({ label: field.label, value: field.value(plant) })).filter(
    (row) => row.value !== null
  );

  const relatedNotes = (plant.relatedNotes ?? [])
    .map((slug) => notes?.find((note) => note.slug === slug) ?? { slug, title: slug })
    .filter(Boolean);

  const transformUri = (uri: string) => {
    if (!uri) return uri;
    if (/^[a-z]+:/i.test(uri) || uri.startsWith('#')) return uri;
    return basePath + uri.replace(/^\.\//, '');
  };

  return (
    <div
      className={`${s.container} ${s.themedPage}`}
      style={{ '--theme-accent': '#4a7c59' } as React.CSSProperties}
    >
      <ThemeBackground theme="plants" seed={plant.id} />
      <div className={s.themedPageContent}>
        <div className={s.back}>
          <Link to="/plants">
            <ArrowLeftIcon />
            В библиотеку
          </Link>
        </div>

        <header className={c.detailHeader}>
          {plant.visual && model && <PlantGrowth plant={plant} model={model} />}
          {plant.visual && !model && (
            <div className={c.detailPortrait}>
              <PlantPortrait
                visual={plant.visual}
                plantId={plant.id}
                label={`Схематичный портрет: ${plant.name}`}
                animated
              />
            </div>
          )}
          <h1 className={s.title}>{plant.name}</h1>
          <p className={c.detailLatin}>{plant.latin}</p>
          <div className={c.detailBadges}>
            <span className={c.badge}>{DIFFICULTY_LABELS[plant.difficulty]}</span>
            <span className={c.badge}>{RARITY_LABELS[plant.rarity]}</span>
            {plant.toxicToPets === true && (
              <span className={`${c.badge} ${c.badgeWarn}`}>Токсично для питомцев</span>
            )}
            {plant.toxicToPets === false && (
              <span className={`${c.badge} ${c.badgeOk}`}>Безопасно для питомцев</span>
            )}
          </div>
          <p className={c.detailSummary}>{plant.summary}</p>
        </header>

        {plant.quirk && (
          <section className={c.section}>
            <h2 className={c.sectionTitle}>Особенность</h2>
            <p>{plant.quirk}</p>
          </section>
        )}

        <section className={c.section}>
          <h2 className={c.sectionTitle}>Параметры</h2>
          <dl className={c.params}>
            {params.map((row) => (
              <div key={row.label} className={c.paramRow}>
                <dt className={c.paramLabel}>{row.label}</dt>
                <dd className={c.paramValue}>{row.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        {(plant.lightNote || plant.waterNote) && (
          <section className={c.section}>
            <h2 className={c.sectionTitle}>Свет и полив</h2>
            {plant.lightNote && <p>{plant.lightNote}</p>}
            {plant.waterNote && <p>{plant.waterNote}</p>}
          </section>
        )}

        {plant.substrate && (
          <section className={c.section}>
            <h2 className={c.sectionTitle}>Субстрат</h2>
            {plant.substrate.note && <p>{plant.substrate.note}</p>}

            {plant.substrate.prefer && plant.substrate.prefer.length > 0 && (
              <>
                <h3 className={c.prosConsTitle}>Что добавить</h3>
                <AdviceList advice={plant.substrate.prefer} components={components} tone="good" />
              </>
            )}

            {plant.substrate.avoid && plant.substrate.avoid.length > 0 && (
              <>
                <h3 className={c.prosConsTitle}>Чего избегать</h3>
                <AdviceList advice={plant.substrate.avoid} components={components} tone="bad" />
              </>
            )}
          </section>
        )}

        {md && (
          <section className={c.section}>
            <article className={s.markdown}>
              <MarkdownContent source={md} urlTransform={transformUri} />
            </article>
          </section>
        )}

        {relatedNotes.length > 0 && (
          <section className={c.section}>
            <h2 className={c.sectionTitle}>Почитать по теме</h2>
            <ul className={c.links}>
              {relatedNotes.map((note) => (
                <li key={note.slug}>
                  <Link to={`/note/${note.slug}`} className={c.link}>
                    {note.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
