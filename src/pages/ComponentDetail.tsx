import { Link, useParams } from 'react-router-dom';
import { useCatalog } from '../hooks/useCatalog';
import { useNotes } from '../hooks/useNotes';
import { Plant, SubstrateComponent } from '../types/catalog';
import { COMPONENT_FIELDS, ROLE_LABELS, THERMAL_LABELS } from '../utils/catalogLabels';
import { ArrowLeftIcon } from '../components/Icons';
import s from '../styles/shared.module.css';
import c from '../styles/catalog.module.css';

export default function ComponentDetail() {
  const { id } = useParams<{ id: string }>();
  const { items: components, error } = useCatalog<SubstrateComponent>('components/catalog.json');
  const { items: plants } = useCatalog<Plant>('species/catalog.json');
  const { notes } = useNotes();

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

  if (!components)
    return (
      <div className={s.container}>
        <div className={s.skeleton}>
          <div className={s.skeletonLine} />
          <div className={s.skeletonLine} />
          <div className={s.skeletonLine} />
        </div>
      </div>
    );

  const component = components.find((item) => item.id === id);

  if (!component)
    return (
      <div className={s.container}>
        <div className={s.back}>
          <Link to="/components">
            <ArrowLeftIcon />
            К компонентам
          </Link>
        </div>
        <div className={c.empty}>
          <p>Такого компонента в справочнике пока нет.</p>
        </div>
      </div>
    );

  const params = COMPONENT_FIELDS.map((field) => ({
    label: field.label,
    value: field.value(component),
  })).filter((row) => row.value !== null);

  // The reverse link that structured data buys us: who asks for this component
  const recommendedBy = (plants ?? []).filter((plant) =>
    plant.substrate?.prefer?.some((advice) => advice.component === component.id)
  );
  const avoidedBy = (plants ?? []).filter((plant) =>
    plant.substrate?.avoid?.some((advice) => advice.component === component.id)
  );

  const relatedNotes = (component.relatedNotes ?? []).map(
    (slug) => notes?.find((note) => note.slug === slug) ?? { slug, title: slug }
  );

  return (
    <div className={s.container}>
      <div className={s.back}>
        <Link to="/components">
          <ArrowLeftIcon />
          К компонентам
        </Link>
      </div>

      <header className={c.detailHeader}>
        <h1 className={s.title}>{component.name}</h1>
        {component.aliases && component.aliases.length > 0 && (
          <p className={c.detailLatin}>{component.aliases.join(', ')}</p>
        )}
        <div className={c.detailBadges}>
          {component.roles.map((role) => (
            <span key={role} className={c.badge}>
              {ROLE_LABELS[role]}
            </span>
          ))}
          {component.thermal === 'cold' && (
            <span className={`${c.badge} ${c.badgeWarn}`}>{THERMAL_LABELS.cold}</span>
          )}
          <span className={`${c.badge} ${component.recommended ? c.badgeOk : c.badgeDanger}`}>
            {component.recommended ? 'Стоит использовать' : 'Лучше не использовать'}
          </span>
        </div>
        <p className={c.detailSummary}>{component.summary}</p>
      </header>

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

      <section className={c.section}>
        <div className={c.prosCons}>
          <div>
            <h2 className={c.prosConsTitle}>Плюсы</h2>
            <ul className={c.prosConsList}>
              {component.pros.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className={c.prosConsTitle}>Минусы</h2>
            <ul className={c.prosConsList}>
              {component.cons.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {component.tips && component.tips.length > 0 && (
        <section className={c.section}>
          <h2 className={c.sectionTitle}>Как использовать</h2>
          <ul className={c.prosConsList}>
            {component.tips.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        </section>
      )}

      {recommendedBy.length > 0 && (
        <section className={c.section}>
          <h2 className={c.sectionTitle}>Кому рекомендуется</h2>
          <ul className={c.links}>
            {recommendedBy.map((plant) => (
              <li key={plant.id}>
                <Link to={`/plants/${plant.id}`} className={c.link}>
                  {plant.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {avoidedBy.length > 0 && (
        <section className={c.section}>
          <h2 className={c.sectionTitle}>Кому не стоит</h2>
          <ul className={c.links}>
            {avoidedBy.map((plant) => (
              <li key={plant.id}>
                <Link to={`/plants/${plant.id}`} className={c.link}>
                  {plant.name}
                </Link>
              </li>
            ))}
          </ul>
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
  );
}
