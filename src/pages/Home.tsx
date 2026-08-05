import { Link } from 'react-router-dom';
import { useNotes } from '../hooks/useNotes';
import { getTopLevelFolder } from '../utils/folders';
import s from './Home.module.css';
import shared from '../styles/shared.module.css';

interface Section {
  key: string;
  title: string;
  description?: string;
  to: string;
  meta: string;
  accent?: string;
  order: number;
}

export default function Home() {
  const { notes, folders, libraries, error } = useNotes();

  if (error)
    return (
      <div className={shared.container}>
        <div className={shared.errorBlock}>
          <p>Не удалось загрузить разделы</p>
          <button className={shared.retryButton} onClick={() => window.location.reload()}>
            Попробовать снова
          </button>
        </div>
      </div>
    );

  if (!notes)
    return (
      <div className={shared.container}>
        <div className={shared.skeleton}>
          <div className={shared.skeletonLine} />
          <div className={shared.skeletonLine} />
          <div className={shared.skeletonLine} />
        </div>
      </div>
    );

  const countByFolder = new Map<string, number>();
  for (const note of notes) {
    const folder = getTopLevelFolder(note.slug);
    countByFolder.set(folder, (countByFolder.get(folder) || 0) + 1);
  }

  const sections: Section[] = [
    ...Object.keys(folders).map((key) => {
      const meta = folders[key];
      const count = countByFolder.get(key) || 0;
      return {
        key,
        title: meta.title,
        description: meta.description,
        to: `/folder/${encodeURIComponent(key)}`,
        meta: count > 0 ? `${count} заметок` : 'Скоро',
        accent: meta.accent,
        order: meta.order ?? 999,
      };
    }),
    ...libraries.map((library) => ({
      key: library.id,
      title: library.title,
      description: library.description,
      to: library.path,
      meta: library.badge ?? 'Библиотека',
      accent: library.accent,
      order: library.order ?? 999,
    })),
  ].sort((a, b) => a.order - b.order);

  return (
    <div className={shared.container}>
      <ul className={s.sectionsList}>
        {sections.map((section) => (
          <li key={section.key}>
            <Link
              to={section.to}
              className={s.sectionCard}
              style={section.accent ? { borderLeftColor: section.accent } : undefined}
            >
              <span className={s.sectionTitle}>{section.title}</span>
              {section.description && (
                <span className={s.sectionDescription}>{section.description}</span>
              )}
              <span className={s.sectionMeta}>{section.meta}</span>
            </Link>
          </li>
        ))}
      </ul>
      <Link to="/all" className={s.allNotesLink}>
        Все заметки
      </Link>
    </div>
  );
}
