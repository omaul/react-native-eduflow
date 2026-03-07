import React from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useNotes } from '../hooks/useNotes';
import { getTopLevelFolder } from '../utils/folders';
import ThemeBackground from '../components/ThemeBackground';
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
  const { folders } = useNotes();
  const [md, setMd] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [basePath, setBasePath] = React.useState<string>(`${import.meta.env.BASE_URL}content/`);

  const topFolder = getTopLevelFolder(effectiveSlug);
  const folderMeta = folders[topFolder];
  const theme = folderMeta?.theme;
  const accent = folderMeta?.accent;

  const from = searchParams.get('from');
  const fromFolder = searchParams.get('folder');
  let backTo = '/';
  let backLabel = '\u2190 На главную';
  if (from === 'all') {
    backTo = '/all';
    backLabel = '\u2190 Ко всем заметкам';
  } else if (from === 'folder' && fromFolder) {
    backTo = `/folder/${encodeURIComponent(fromFolder)}`;
    backLabel = `\u2190 ${folderMeta?.title || fromFolder}`;
  }

  React.useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!effectiveSlug) return;
      const contentRoot = `${import.meta.env.BASE_URL}content/`;
      const tryIndex = `${contentRoot}${effectiveSlug}/index.md`;
      const tryFlat = `${contentRoot}${effectiveSlug}.md`;

      async function fetchMarkdown(url: string) {
        const r = await fetch(url);
        if (!r.ok) return null;
        const ct = r.headers.get('content-type') || '';
        if (ct.includes('text/html')) return null;
        const txt = await r.text();
        if (/^\s*<!doctype html>/i.test(txt)) return null;
        return txt;
      }

      try {
        setError(null);
        setMd(null);
        const fromIndex = await fetchMarkdown(tryIndex);
        if (fromIndex && !cancelled) {
          setMd(fromIndex);
          setBasePath(`${contentRoot}${effectiveSlug}/`);
          return;
        }
        const fromFlat = await fetchMarkdown(tryFlat);
        if (fromFlat && !cancelled) {
          setMd(fromFlat);
          const dir = effectiveSlug.replace(/[^/]+$/, '');
          setBasePath(`${contentRoot}${dir}`);
          return;
        }
        if (!cancelled) {
          setError('Не удалось загрузить заметку');
          setMd(null);
        }
      } catch (e: any) {
        if (!cancelled) {
          setError(e?.message || 'Ошибка');
          setMd(null);
        }
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [effectiveSlug]);

  const transformUri = (uri: string) => {
    if (!uri) return uri;
    if (/^[a-z]+:/i.test(uri) || uri.startsWith('#')) return uri;
    return basePath + uri.replace(/^\.\//, '');
  };

  return (
    <div className={`${s.container} ${s.themedPage}`} style={accent ? { '--theme-accent': accent } as React.CSSProperties : undefined}>
      {theme && <ThemeBackground theme={theme} seed={effectiveSlug} />}
      <div className={s.themedPageContent}>
        <div className={s.back}>
          <Link to={backTo}>{backLabel}</Link>
        </div>
        {error && <p>Ошибка: {error}</p>}
        {!error && !md && <p>Загрузка…</p>}
        {md && (
          <article className={s.markdown}>
            <ReactMarkdown remarkPlugins={[remarkGfm]} urlTransform={transformUri}>
              {md}
            </ReactMarkdown>
          </article>
        )}
      </div>
    </div>
  );
}
