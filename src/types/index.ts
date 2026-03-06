export type NoteMeta = {
  slug: string;
  title: string;
  description?: string;
  tags?: string[];
  date?: string;
};

export type FolderMeta = {
  title: string;
  theme?: string;
  accent?: string;
};

export type ContentIndex = {
  folders: Record<string, FolderMeta>;
  notes: NoteMeta[];
};
