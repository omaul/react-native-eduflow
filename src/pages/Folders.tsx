import React from 'react';
import { Link } from 'react-router-dom';

type NoteMeta = {
  slug: string;
  title: string;
};

export default function Folders() {
  const [notes, setNotes] = React.useState<NoteMeta[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetch(process.env.PUBLIC_URL + '/content/index.json')
      .then((r) => {
        if (!r.ok) throw new Error('Failed to load index.json');
        return r.json();
      })
      .then((data: NoteMeta[]) => setNotes(data))
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <div className="Container"><p>Ошибка: {error}</p></div>;
  if (!notes) return <div className="Container"><p>Загрузка…</p></div>;

  const folderToNotes = new Map<string, NoteMeta[]>();
  for (const n of notes) {
    const parts = n.slug.split('/');
    const folder = parts.length > 1 ? parts[0] : '_root';
    if (!folderToNotes.has(folder)) folderToNotes.set(folder, []);
    folderToNotes.get(folder)!.push(n);
  }

  const folders = Array.from(folderToNotes.keys()).sort();

  return (
    <div className="Container">
      <h1 className="Title">Папки</h1>
      <ul className="NotesList">
        {folders.map((f) => (
          <li key={f} className="NotesList__item">
            <Link to={`/folder/${encodeURIComponent(f)}`} className="NoteLink">
              <div className="NoteTitle">{f === '_root' ? 'Без папки' : f}</div>
              <div className="NoteMeta">{folderToNotes.get(f)?.length || 0} заметок</div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}


