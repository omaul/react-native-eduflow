import { Link, useParams } from 'react-router-dom';
import { useNotes } from '../hooks/useNotes';
import { ROOT_FOLDER, getTopLevelFolder } from '../utils/folders';
import NoteMetaInfo from '../components/NoteMetaInfo';
import ThemeBackground from '../components/ThemeBackground';

export default function FolderView() {
  const { folder } = useParams();
  const { notes, folders, error } = useNotes();

  if (error) return <div className="Container"><p>Ошибка: {error}</p></div>;
  if (!notes) return <div className="Container"><p>Загрузка…</p></div>;

  const folderMeta = folder ? folders[folder] : undefined;
  const theme = folderMeta?.theme;
  const accent = folderMeta?.accent;

  const list = notes.filter((n) => {
    return (folder || ROOT_FOLDER) === getTopLevelFolder(n.slug);
  });

  const title = folderMeta?.title || folder || 'Без папки';

  return (
    <div className="Container ThemedPage" style={accent ? { '--theme-accent': accent } as React.CSSProperties : undefined}>
      {theme && <ThemeBackground theme={theme} seed={folder || 'root'} />}
      <div className="ThemedPage__content">
        <div className="Back"><Link to="/folders">← Ко всем папкам</Link></div>
        <h1 className="Title">{title}</h1>
        <ul className="NotesList">
          {list.map((note) => (
            <li key={note.slug} className="NotesList__item">
              <Link to={`/note/${note.slug}?from=folder&folder=${encodeURIComponent(folder || '')}`} className="NoteLink">
                <div className="NoteTitle">{note.title}</div>
                {note.description && <div className="NoteDescription">{note.description}</div>}
                <NoteMetaInfo date={note.date} tags={note.tags} />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
