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

export type ContentIndex = {
  folders: Record<string, FolderMeta>;
  notes: NoteMeta[];
};
