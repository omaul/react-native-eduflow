import { useState, useEffect } from 'react';
import { Catalog } from '../types/catalog';

/**
 * Loads a static catalog from public/content/<file>.
 * Same shape as useNotes: null items mean "still loading".
 */
export function useCatalog<T>(file: string) {
  const [items, setItems] = useState<T[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const url = `${import.meta.env.BASE_URL}content/${file}`;

    fetch(url)
      .then((response) => {
        if (!response.ok) throw new Error(`Failed to load ${file}`);
        return response.json();
      })
      .then((data: Catalog<T>) => {
        if (!cancelled) setItems(data.items || []);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Ошибка загрузки');
      });

    return () => {
      cancelled = true;
    };
  }, [file]);

  return { items, error };
}
