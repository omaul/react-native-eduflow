import { useState, useEffect } from 'react';
import { ContentIndex, NoteMeta, FolderMeta, LibraryMeta } from '../types';

const INDEX_URL = import.meta.env.BASE_URL + 'content/index.json';

export function useNotes() {
  const [notes, setNotes] = useState<NoteMeta[] | null>(null);
  const [folders, setFolders] = useState<Record<string, FolderMeta>>({});
  const [libraries, setLibraries] = useState<LibraryMeta[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(INDEX_URL)
      .then((r) => {
        if (!r.ok) throw new Error('Failed to load index.json');
        return r.json();
      })
      .then((data: ContentIndex) => {
        setNotes(data.notes);
        setFolders(data.folders || {});
        setLibraries(data.libraries || []);
      })
      .catch((e) => setError(e.message));
  }, []);

  return { notes, folders, libraries, error };
}
