export const ROOT_FOLDER = '_root';
export const DEFAULT_SUBTOPIC = '_default';

export function getTopLevelFolder(slug: string): string {
  const parts = slug.split('/');
  return parts.length > 1 ? parts[0] : ROOT_FOLDER;
}

/** slug "care/medium/definitions" → "medium"; a two-part slug has no subtopic */
export function getSubtopic(slug: string): string {
  const parts = slug.split('/');
  return parts.length >= 3 ? parts[1] : DEFAULT_SUBTOPIC;
}
