import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useNotes } from '../hooks/useNotes';
import { NoteMeta } from '../types';
import { ROOT_FOLDER, getTopLevelFolder, getSubtopic } from '../utils/folders';
import NoteMetaInfo from '../components/NoteMetaInfo';
import ThemeBackground from '../components/ThemeBackground';
import { ArrowLeftIcon } from '../components/Icons';
import s from '../styles/shared.module.css';

export default function FolderView() {
  const { folder } = useParams();
  const { notes, folders, error } = useNotes();

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

  const folderMeta = folder ? folders[folder] : undefined;
  const theme = folderMeta?.theme;
  const accent = folderMeta?.accent;
  const subtopics = folderMeta?.subtopics;

  const list = notes.filter((n) => {
    return (folder || ROOT_FOLDER) === getTopLevelFolder(n.slug);
  });

  const title = folderMeta?.title || folder || 'Без папки';

  // Group notes by subtopic if subtopics are defined
  const hasSubtopics = subtopics && Object.keys(subtopics).length > 0;
  let groups: { key: string; title: string; notes: NoteMeta[] }[] = [];

  if (hasSubtopics) {
    const bySubtopic = new Map<string, NoteMeta[]>();
    for (const note of list) {
      const sub = getSubtopic(note.slug);
      if (!bySubtopic.has(sub)) bySubtopic.set(sub, []);
      bySubtopic.get(sub)!.push(note);
    }

    const sortedKeys = Array.from(bySubtopic.keys()).sort((a, b) => {
      const oa = subtopics[a]?.order ?? 999;
      const ob = subtopics[b]?.order ?? 999;
      return oa - ob;
    });

    groups = sortedKeys.map((key) => ({
      key,
      title: subtopics[key]?.title || key,
      notes: bySubtopic.get(key) || [],
    }));
  }

  return (
    <div
      className={`${s.container} ${theme ? s.themedPage : ''}`}
      style={accent ? ({ '--theme-accent': accent } as React.CSSProperties) : undefined}
    >
      {theme && <ThemeBackground theme={theme} seed={folder || 'root'} />}
      <div className={theme ? s.themedPageContent : undefined}>
        <div className={s.back}>
          <Link to="/">
            <ArrowLeftIcon />
            На главную
          </Link>
        </div>
        <h1 className={s.title}>{title}</h1>
        {folderMeta?.description && (
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)' }}>
            {folderMeta.description}
          </p>
        )}
        {list.length === 0 ? (
          <p style={{ color: 'var(--color-text-muted)' }}>
            Раздел пока пуст — скоро здесь появятся заметки.
          </p>
        ) : hasSubtopics ? (
          groups.map((group) => (
            <section key={group.key} style={{ marginBottom: 'var(--space-6)' }}>
              <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-2)' }}>
                {group.title}
              </h2>
              <ul className={s.notesList}>
                {group.notes.map((note) => (
                  <li key={note.slug}>
                    <Link
                      to={`/note/${note.slug}?from=folder&folder=${encodeURIComponent(folder || '')}`}
                      className={s.noteLink}
                    >
                      <span className={s.noteTitle}>{note.title}</span>
                      {note.description && (
                        <span className={s.noteDescription}>{note.description}</span>
                      )}
                      <NoteMetaInfo date={note.date} tags={note.tags} />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))
        ) : (
          <ul className={s.notesList}>
            {list.map((note) => (
              <li key={note.slug}>
                <Link
                  to={`/note/${note.slug}?from=folder&folder=${encodeURIComponent(folder || '')}`}
                  className={s.noteLink}
                >
                  <span className={s.noteTitle}>{note.title}</span>
                  {note.description && (
                    <span className={s.noteDescription}>{note.description}</span>
                  )}
                  <NoteMetaInfo date={note.date} tags={note.tags} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
