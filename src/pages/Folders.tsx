import { Link } from 'react-router-dom';
import { useNotes } from '../hooks/useNotes';
import { NoteMeta } from '../types';
import { ROOT_FOLDER, getTopLevelFolder } from '../utils/folders';

export default function Folders() {
  const { notes, folders, error } = useNotes();

  if (error) return <div className="Container"><p>Ошибка: {error}</p></div>;
  if (!notes) return <div className="Container"><p>Загрузка…</p></div>;

  const folderToNotes = new Map<string, NoteMeta[]>();
  for (const n of notes) {
    const folder = getTopLevelFolder(n.slug);
    if (!folderToNotes.has(folder)) folderToNotes.set(folder, []);
    folderToNotes.get(folder)!.push(n);
  }

  const folderKeys = Array.from(folderToNotes.keys()).sort();

  return (
    <div className="Container">
      <h1 className="Title">Папки</h1>
      <ul className="NotesList">
        {folderKeys.map((f) => {
          const meta = folders[f];
          const title = f === ROOT_FOLDER ? 'Без папки' : (meta?.title || f);
          return (
            <li key={f} className="NotesList__item">
              <Link
                to={`/folder/${encodeURIComponent(f)}`}
                className="NoteLink"
                style={meta?.accent ? { borderLeftColor: meta.accent, borderLeftWidth: 3 } : undefined}
              >
                <div className="NoteTitle">{title}</div>
                <div className="NoteMeta">{folderToNotes.get(f)?.length || 0} заметок</div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
