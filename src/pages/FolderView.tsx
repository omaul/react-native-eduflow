import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useNotes } from '../hooks/useNotes';
import { ROOT_FOLDER, getTopLevelFolder } from '../utils/folders';
import NoteMetaInfo from '../components/NoteMetaInfo';
import ThemeBackground from '../components/ThemeBackground';
import s from '../styles/shared.module.css';

export default function FolderView() {
  const { folder } = useParams();
  const { notes, folders, error } = useNotes();

  if (error) return (
    <div className={s.container}>
      <div className={s.errorBlock}>
        <p>Не удалось загрузить заметки</p>
        <button className={s.retryButton} onClick={() => window.location.reload()}>Попробовать снова</button>
      </div>
    </div>
  );
  if (!notes) return (
    <div className={s.container}>
      <div className={s.skeleton}>
        <div className={s.skeletonLine} />
        <div className={s.skeletonLine} />
        <div className={s.skeletonLine} />
        <div className={s.skeletonLine} />
      </div>
    </div>
  );

  const folderMeta = folder ? folders[folder] : undefined;
  const theme = folderMeta?.theme;
  const accent = folderMeta?.accent;

  const list = notes.filter((n) => {
    return (folder || ROOT_FOLDER) === getTopLevelFolder(n.slug);
  });

  const title = folderMeta?.title || folder || 'Без папки';

  return (
    <div className={`${s.container} ${s.themedPage}`} style={accent ? { '--theme-accent': accent } as React.CSSProperties : undefined}>
      {theme && <ThemeBackground theme={theme} seed={folder || 'root'} />}
      <div className={s.themedPageContent}>
        <div className={s.back}><Link to="/folders">← Ко всем папкам</Link></div>
        <h1 className={s.title}>{title}</h1>
        <ul className={s.notesList}>
          {list.map((note) => (
            <li key={note.slug}>
              <Link to={`/note/${note.slug}?from=folder&folder=${encodeURIComponent(folder || '')}`} className={s.noteLink}>
                <div className={s.noteTitle}>{note.title}</div>
                {note.description && <div className={s.noteDescription}>{note.description}</div>}
                <NoteMetaInfo date={note.date} tags={note.tags} />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
