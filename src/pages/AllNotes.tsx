import { Link } from 'react-router-dom';
import { useNotes } from '../hooks/useNotes';
import NoteMetaInfo from '../components/NoteMetaInfo';
import s from '../styles/shared.module.css';

export default function AllNotes() {
  const { notes, error } = useNotes();

  if (error)
    return (
      <div className={s.container}>
        <div className={s.errorBlock}>
          <p>Не удалось загрузить заметки</p>
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

  return (
    <div className={s.container}>
      <div className={s.back}>
        <Link to="/">← На главную</Link>
      </div>
      <h1 className={s.title}>Все заметки</h1>
      <ul className={s.notesList}>
        {notes.map((note) => (
          <li key={note.slug}>
            <Link to={`/note/${note.slug}?from=all`} className={s.noteLink}>
              <div className={s.noteTitle}>{note.title}</div>
              {note.description && <div className={s.noteDescription}>{note.description}</div>}
              <NoteMetaInfo date={note.date} tags={note.tags} />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
