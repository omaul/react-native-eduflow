import React from 'react';
import { Link, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function NoteViewer() {
  const { slug } = useParams();
  const [md, setMd] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!slug) return;
    const url = `${process.env.PUBLIC_URL}/content/${slug}.md`;
    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error('Не удалось загрузить заметку');
        return r.text();
      })
      .then((txt) => setMd(txt))
      .catch((e) => setError(e.message));
  }, [slug]);

  return (
    <div className="Container">
      <div className="Back">
        <Link to="/">← Ко всем заметкам</Link>
      </div>
      {error && <p>Ошибка: {error}</p>}
      {!error && !md && <p>Загрузка…</p>}
      {md && (
        <article className="Markdown">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{md}</ReactMarkdown>
        </article>
      )}
    </div>
  );
}


