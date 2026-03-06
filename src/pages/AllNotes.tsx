import { Link } from 'react-router-dom';
import { useNotes } from '../hooks/useNotes';
import NoteMetaInfo from '../components/NoteMetaInfo';

export default function AllNotes() {
  const { notes, error } = useNotes();

  if (error) return <div className="Container"><p>Ошибка: {error}</p></div>;
  if (!notes) return <div className="Container"><p>Загрузка…</p></div>;

  return (
    <div className="Container">
      <div className="Back"><Link to="/">← На главную</Link></div>
      <h1 className="Title">Все заметки</h1>
      <ul className="NotesList">
        {notes.map((note) => (
          <li key={note.slug} className="NotesList__item">
            <Link to={`/note/${note.slug}?from=all`} className="NoteLink">
              <div className="NoteTitle">{note.title}</div>
              {note.description && <div className="NoteDescription">{note.description}</div>}
              <NoteMetaInfo date={note.date} tags={note.tags} />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
