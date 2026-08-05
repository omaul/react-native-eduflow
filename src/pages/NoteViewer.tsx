import React from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import MarkdownContent from '../components/md/MarkdownContent';
import { useNotes } from '../hooks/useNotes';
import { useMarkdown } from '../hooks/useMarkdown';
import { getTopLevelFolder, getSubtopic, DEFAULT_SUBTOPIC } from '../utils/folders';
import { buildCourseSequence, getCourseNavigation } from '../utils/courseNav';
import ThemeBackground from '../components/ThemeBackground';
import { CourseRail, CoursePager } from '../components/CourseNav';
import { ArrowLeftIcon } from '../components/Icons';
import s from '../styles/shared.module.css';

type Params = {
  slug?: string;
  '*': string;
};

function useEffectiveSlug() {
  const params = useParams<Params>();
  return params['*'] || params.slug || '';
}

export default function NoteViewer() {
  const effectiveSlug = useEffectiveSlug();
  const [searchParams] = useSearchParams();
  const { notes, folders } = useNotes();

  const contentRoot = `${import.meta.env.BASE_URL}content/`;
  const candidates = React.useMemo(
    () =>
      effectiveSlug
        ? [`${contentRoot}${effectiveSlug}/index.md`, `${contentRoot}${effectiveSlug}.md`]
        : [],
    [effectiveSlug, contentRoot]
  );
  const { md, error, basePath } = useMarkdown(candidates, contentRoot);

  const topFolder = getTopLevelFolder(effectiveSlug);
  const folderMeta = folders[topFolder];

  const subtopicKey = getSubtopic(effectiveSlug);
  const subtopicMeta =
    subtopicKey === DEFAULT_SUBTOPIC ? undefined : folderMeta?.subtopics?.[subtopicKey];

  const theme = subtopicMeta?.theme ?? folderMeta?.theme;
  const accent = subtopicMeta?.accent ?? folderMeta?.accent;

  const courseNav = notes
    ? getCourseNavigation(buildCourseSequence(notes, topFolder, folderMeta), effectiveSlug)
    : null;

  const from = searchParams.get('from');
  const fromFolder = searchParams.get('folder');
  let backTo = '/';
  let backLabel = 'На главную';
  if (from === 'all') {
    backTo = '/all';
    backLabel = 'Ко всем заметкам';
  } else if (from === 'folder' && fromFolder) {
    backTo = `/folder/${encodeURIComponent(fromFolder)}`;
    backLabel = folderMeta?.title || fromFolder;
  }

  const transformUri = (uri: string) => {
    if (!uri) return uri;
    if (/^[a-z]+:/i.test(uri) || uri.startsWith('#')) return uri;
    return basePath + uri.replace(/^\.\//, '');
  };

  return (
    <div
      className={`${s.container} ${s.themedPage}`}
      style={accent ? ({ '--theme-accent': accent } as React.CSSProperties) : undefined}
    >
      {theme && <ThemeBackground theme={theme} seed={effectiveSlug} />}
      <div className={s.themedPageContent}>
        <div className={s.back}>
          <Link to={backTo}>
            <ArrowLeftIcon />
            {backLabel}
          </Link>
        </div>
        {courseNav && courseNav.siblings.length > 1 && <CourseRail nav={courseNav} />}
        {error && (
          <div className={s.errorBlock}>
            <p>Не удалось загрузить заметку</p>
            <button className={s.retryButton} onClick={() => window.location.reload()}>
              Попробовать снова
            </button>
          </div>
        )}
        {!error && !md && (
          <div className={s.skeleton}>
            <div className={s.skeletonLine} />
            <div className={s.skeletonLine} />
            <div className={s.skeletonLine} />
            <div className={s.skeletonLine} />
          </div>
        )}
        {md && (
          <article className={s.markdown}>
            <MarkdownContent source={md} urlTransform={transformUri} />
          </article>
        )}
        {md && courseNav && <CoursePager nav={courseNav} />}
      </div>
    </div>
  );
}
