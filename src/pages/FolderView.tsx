import React from 'react';
import { Link, useParams } from 'react-router-dom';

type NoteMeta = {
  slug: string;
  title: string;
  description?: string;
  tags?: string[];
  date?: string;
};

export default function FolderView() {
  const { folder } = useParams();
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

  const list = notes.filter((n) => {
    const parts = n.slug.split('/');
    const top = parts.length > 1 ? parts[0] : '_root';
    return (folder || '_root') === top;
  });

  return (
    <div className="Container">
      <div className="Back"><Link to="/folders">← Ко всем папкам</Link></div>
      <h1 className="Title">{folder || 'Без папки'}</h1>
      <ul className="NotesList">
        {list.map((note) => (
          <li key={note.slug} className="NotesList__item">
            <Link to={`/note/${note.slug}?from=folder&folder=${encodeURIComponent(folder || '')}`} className="NoteLink">
              <div className="NoteTitle">{note.title}</div>
              {note.description && <div className="NoteDescription">{note.description}</div>}
              <div className="NoteMeta">
                {note.date && <span>{note.date}</span>}
                {note.tags && note.tags.length > 0 && (
                  <span>{note.tags.map((t) => `#${t}`).join(' ')}</span>
                )}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}


