import { Link } from 'react-router-dom';
import { useNotes } from '../hooks/useNotes';
import { getTopLevelFolder } from '../utils/folders';
import s from './Home.module.css';
import shared from '../styles/shared.module.css';

export default function Home() {
  const { notes, folders, error } = useNotes();

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

  const folderKeys = Object.keys(folders).sort((a, b) => {
    const oa = folders[a]?.order ?? 999;
    const ob = folders[b]?.order ?? 999;
    return oa - ob;
  });

  const countByFolder = new Map<string, number>();
  for (const n of notes) {
    const f = getTopLevelFolder(n.slug);
    countByFolder.set(f, (countByFolder.get(f) || 0) + 1);
  }

  return (
    <div className={shared.container}>
      <ul className={s.sectionsList}>
        {folderKeys.map((key) => {
          const meta = folders[key];
          const count = countByFolder.get(key) || 0;
          return (
            <li key={key}>
              <Link
                to={`/folder/${encodeURIComponent(key)}`}
                className={s.sectionCard}
                style={meta.accent ? { borderLeftColor: meta.accent } : undefined}
              >
                <span className={s.sectionTitle}>{meta.title}</span>
                {meta.description && (
                  <span className={s.sectionDescription}>{meta.description}</span>
                )}
                <span className={s.sectionMeta}>
                  {count > 0 ? `${count} заметок` : 'Скоро'}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
      <Link to="/all" className={s.allNotesLink}>
        Все заметки
      </Link>
    </div>
  );
}
