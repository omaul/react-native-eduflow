/**
 * Pure catalog logic: filtering, searching, sorting.
 * No React here — see src/utils/catalogLabels.ts for the human-readable specs.
 */

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterSpec<T> {
  key: string;
  label: string;
  options: FilterOption[];
  /** Does this item satisfy the given option value? */
  match: (item: T, value: string) => boolean;
}

/** filter key -> selected option values */
export type ActiveFilters = Record<string, string[]>;

/**
 * Options inside one filter are OR-ed, different filters are AND-ed:
 * "(обычное ИЛИ интересное) И (безопасно для питомцев)".
 */
export function applyFilters<T>(
  items: T[],
  specs: FilterSpec<T>[],
  active: ActiveFilters
): T[] {
  const engaged = specs.filter((spec) => (active[spec.key]?.length ?? 0) > 0);
  if (engaged.length === 0) return items;

  return items.filter((item) =>
    engaged.every((spec) => active[spec.key].some((value) => spec.match(item, value)))
  );
}

export function toggleFilter(
  active: ActiveFilters,
  key: string,
  value: string
): ActiveFilters {
  const current = active[key] ?? [];
  const next = current.includes(value)
    ? current.filter((item) => item !== value)
    : [...current, value];

  const result = { ...active };
  if (next.length === 0) delete result[key];
  else result[key] = next;
  return result;
}

export function countActiveFilters(active: ActiveFilters): number {
  return Object.values(active).reduce((total, values) => total + values.length, 0);
}

function normalize(value: string): string {
  return value.toLowerCase().replace(/ё/g, 'е').trim();
}

/**
 * Substring search across the fields returned by `haystack`.
 * Tolerant to case and to е/ё, which people type interchangeably in Russian.
 */
export function searchItems<T>(
  items: T[],
  query: string,
  haystack: (item: T) => (string | undefined)[]
): T[] {
  const needle = normalize(query);
  if (!needle) return items;

  return items.filter((item) =>
    haystack(item).some((field) => field && normalize(field).includes(needle))
  );
}
