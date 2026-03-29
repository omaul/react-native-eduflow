import { Link } from 'react-router-dom';
import { useNotes } from '../hooks/useNotes';
import { NoteMeta } from '../types';
import { ROOT_FOLDER, getTopLevelFolder } from '../utils/folders';
import s from '../styles/shared.module.css';

export default function Folders() {
  const { notes, folders, error } = useNotes();

  if (error)
    return (
      <div className={s.container}>
        <div className={s.errorBlock}>
          <p>Не удалось загрузить разделы</p>
          <button className={s.retryButton} onClick={() => window.location.reload()}>
            Попробовать снова
          </button>
        </div>
      </div>
    );
  if (!notes)
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

  const folderToNotes = new Map<string, NoteMeta[]>();
  for (const n of notes) {
    const folder = getTopLevelFolder(n.slug);
    if (!folderToNotes.has(folder)) folderToNotes.set(folder, []);
    folderToNotes.get(folder)!.push(n);
  }

  // Include folders from metadata even if they have no notes yet
  for (const key of Object.keys(folders)) {
    if (!folderToNotes.has(key)) folderToNotes.set(key, []);
  }

  const folderKeys = Array.from(folderToNotes.keys()).sort((a, b) => {
    const oa = folders[a]?.order ?? 999;
    const ob = folders[b]?.order ?? 999;
    return oa - ob;
  });

  return (
    <div className={s.container}>
      <h1 className={s.title}>Разделы</h1>
      <ul className={s.notesList}>
        {folderKeys.map((f) => {
          const meta = folders[f];
          const title = f === ROOT_FOLDER ? 'Без папки' : meta?.title || f;
          const count = folderToNotes.get(f)?.length || 0;
          return (
            <li key={f}>
              <Link
                to={`/folder/${encodeURIComponent(f)}`}
                className={s.noteLink}
                style={
                  meta?.accent ? { borderLeftColor: meta.accent, borderLeftWidth: 3 } : undefined
                }
              >
                <span className={s.noteTitle}>{title}</span>
                {meta?.description && (
                  <span className={s.noteDescription}>{meta.description}</span>
                )}
                <span className={s.noteMeta}>
                  {count > 0 ? `${count} заметок` : 'Скоро'}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
