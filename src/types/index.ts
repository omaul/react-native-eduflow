export type NoteMeta = {
  slug: string;
  title: string;
  description?: string;
  tags?: string[];
  date?: string;
};

export type SubtopicMeta = {
  title: string;
  theme?: string;
  accent?: string;
  order?: number;
};

export type FolderMeta = {
  title: string;
  description?: string;
  theme?: string;
  accent?: string;
  order?: number;
  subtopics?: Record<string, SubtopicMeta>;
};

/** A browsable catalog that lives outside the notes tree (plants, components) */
export type LibraryMeta = {
  id: string;
  title: string;
  description?: string;
  path: string;
  badge?: string;
  accent?: string;
  order?: number;
};

export type ContentIndex = {
  folders: Record<string, FolderMeta>;
  libraries?: LibraryMeta[];
  notes: NoteMeta[];
};
