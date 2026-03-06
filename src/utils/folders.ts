export const ROOT_FOLDER = '_root';

export function getTopLevelFolder(slug: string): string {
  const parts = slug.split('/');
  return parts.length > 1 ? parts[0] : ROOT_FOLDER;
}
