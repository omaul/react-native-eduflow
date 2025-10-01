import React from 'react';
import { Link, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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
  const [md, setMd] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [basePath, setBasePath] = React.useState<string>(`${process.env.PUBLIC_URL}/content/`);

  React.useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!effectiveSlug) return;
      const contentRoot = `${process.env.PUBLIC_URL}/content/`;
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
        if (!cancelled) throw new Error('Не удалось загрузить заметку');
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
    <div className="Container">
      <div className="Back">
        <Link to="/">← Ко всем заметкам</Link>
      </div>
      {error && <p>Ошибка: {error}</p>}
      {!error && !md && <p>Загрузка…</p>}
      {md && (
        <article className="Markdown">
          <ReactMarkdown remarkPlugins={[remarkGfm]} urlTransform={transformUri}>
            {md}
          </ReactMarkdown>
        </article>
      )}
    </div>
  );
}


