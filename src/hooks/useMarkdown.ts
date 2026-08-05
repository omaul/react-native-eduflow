import { useState, useEffect } from 'react';

interface MarkdownState {
  md: string | null;
  error: string | null;
  /** Directory of the file that loaded, for resolving relative image paths */
  basePath: string;
}

/**
 * Fetches the first candidate URL that returns real markdown.
 *
 * GitHub Pages answers 404 with an HTML page, so a successful response is only
 * trusted when it is not HTML.
 */
export function useMarkdown(candidates: string[], fallbackBasePath: string): MarkdownState {
  const [state, setState] = useState<MarkdownState>({
    md: null,
    error: null,
    basePath: fallbackBasePath,
  });

  const key = candidates.join('|');

  useEffect(() => {
    let cancelled = false;
    const urls = key ? key.split('|') : [];

    async function fetchMarkdown(url: string): Promise<string | null> {
      const response = await fetch(url);
      if (!response.ok) return null;
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('text/html')) return null;
      const text = await response.text();
      if (/^\s*<!doctype html>/i.test(text)) return null;
      return text;
    }

    async function load() {
      if (urls.length === 0) return;
      setState({ md: null, error: null, basePath: fallbackBasePath });

      try {
        for (const url of urls) {
          const text = await fetchMarkdown(url);
          if (cancelled) return;
          if (text !== null) {
            setState({
              md: text,
              error: null,
              basePath: url.replace(/[^/]+$/, ''),
            });
            return;
          }
        }
        if (!cancelled) {
          setState({ md: null, error: 'Не удалось загрузить заметку', basePath: fallbackBasePath });
        }
      } catch (e: unknown) {
        if (!cancelled) {
          setState({
            md: null,
            error: e instanceof Error ? e.message : 'Ошибка',
            basePath: fallbackBasePath,
          });
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [key, fallbackBasePath]);

  return state;
}
