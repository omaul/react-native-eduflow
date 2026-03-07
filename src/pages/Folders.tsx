import { Link } from 'react-router-dom';
import { useNotes } from '../hooks/useNotes';
import { NoteMeta } from '../types';
import { ROOT_FOLDER, getTopLevelFolder } from '../utils/folders';
import s from '../styles/shared.module.css';

export default function Folders() {
  const { notes, folders, error } = useNotes();

  if (error) return <div className={s.container}><p>Ошибка: {error}</p></div>;
  if (!notes) return <div className={s.container}><p>Загрузка…</p></div>;

  const folderToNotes = new Map<string, NoteMeta[]>();
  for (const n of notes) {
    const folder = getTopLevelFolder(n.slug);
    if (!folderToNotes.has(folder)) folderToNotes.set(folder, []);
    folderToNotes.get(folder)!.push(n);
  }

  const folderKeys = Array.from(folderToNotes.keys()).sort();

  return (
    <div className={s.container}>
      <h1 className={s.title}>Папки</h1>
      <ul className={s.notesList}>
        {folderKeys.map((f) => {
          const meta = folders[f];
          const title = f === ROOT_FOLDER ? 'Без папки' : (meta?.title || f);
          return (
            <li key={f}>
              <Link
                to={`/folder/${encodeURIComponent(f)}`}
                className={s.noteLink}
                style={meta?.accent ? { borderLeftColor: meta.accent, borderLeftWidth: 3 } : undefined}
              >
                <div className={s.noteTitle}>{title}</div>
                <div className={s.noteMeta}>{folderToNotes.get(f)?.length || 0} заметок</div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
