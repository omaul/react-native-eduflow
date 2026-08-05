import { describe, it, expect } from 'vitest';
import {
  applyFilters,
  toggleFilter,
  countActiveFilters,
  searchItems,
  FilterSpec,
} from './catalog';

interface Item {
  name: string;
  latin?: string;
  aliases?: string[];
  rarity: string;
  safe: boolean;
}

const ITEMS: Item[] = [
  { name: 'Монстера', latin: 'Monstera deliciosa', rarity: 'common', safe: false },
  { name: 'Хлорофитум', latin: 'Chlorophytum comosum', rarity: 'common', safe: true },
  { name: 'Алоказия', latin: 'Alocasia', aliases: ['слоновье ухо'], rarity: 'interesting', safe: false },
  { name: 'Пилея', latin: 'Pilea peperomioides', rarity: 'interesting', safe: true },
];

const SPECS: FilterSpec<Item>[] = [
  {
    key: 'rarity',
    label: 'Тип',
    options: [
      { value: 'common', label: 'Обычные' },
      { value: 'interesting', label: 'Интересные' },
    ],
    match: (item, value) => item.rarity === value,
  },
  {
    key: 'safe',
    label: 'Питомцы',
    options: [{ value: 'yes', label: 'Безопасно' }],
    match: (item, value) => (value === 'yes' ? item.safe : !item.safe),
  },
];

describe('applyFilters', () => {
  it('returns everything when nothing is selected', () => {
    expect(applyFilters(ITEMS, SPECS, {})).toHaveLength(4);
  });

  it('ignores a filter key with an empty selection', () => {
    expect(applyFilters(ITEMS, SPECS, { rarity: [] })).toHaveLength(4);
  });

  it('ORs options inside one filter', () => {
    const result = applyFilters(ITEMS, SPECS, { rarity: ['common', 'interesting'] });
    expect(result).toHaveLength(4);
  });

  it('filters by a single option', () => {
    const result = applyFilters(ITEMS, SPECS, { rarity: ['interesting'] });
    expect(result.map((item) => item.name)).toEqual(['Алоказия', 'Пилея']);
  });

  it('ANDs different filters together', () => {
    const result = applyFilters(ITEMS, SPECS, { rarity: ['interesting'], safe: ['yes'] });
    expect(result.map((item) => item.name)).toEqual(['Пилея']);
  });

  it('can return an empty result', () => {
    const result = applyFilters(ITEMS, SPECS, { rarity: ['rare'] });
    expect(result).toEqual([]);
  });

  it('ignores unknown filter keys', () => {
    const result = applyFilters(ITEMS, SPECS, { nonsense: ['x'] });
    expect(result).toHaveLength(4);
  });
});

describe('toggleFilter', () => {
  it('adds a value', () => {
    expect(toggleFilter({}, 'rarity', 'common')).toEqual({ rarity: ['common'] });
  });

  it('adds a second value to the same key', () => {
    const result = toggleFilter({ rarity: ['common'] }, 'rarity', 'rare');
    expect(result.rarity).toEqual(['common', 'rare']);
  });

  it('removes a value that was selected', () => {
    const result = toggleFilter({ rarity: ['common', 'rare'] }, 'rarity', 'common');
    expect(result.rarity).toEqual(['rare']);
  });

  it('drops the key entirely when the last value is removed', () => {
    expect(toggleFilter({ rarity: ['common'] }, 'rarity', 'common')).toEqual({});
  });

  it('does not mutate the input', () => {
    const active = { rarity: ['common'] };
    toggleFilter(active, 'rarity', 'rare');
    expect(active).toEqual({ rarity: ['common'] });
  });
});

describe('countActiveFilters', () => {
  it('counts every selected value across keys', () => {
    expect(countActiveFilters({ rarity: ['common', 'rare'], safe: ['yes'] })).toBe(3);
  });

  it('is zero for no filters', () => {
    expect(countActiveFilters({})).toBe(0);
  });
});

describe('searchItems', () => {
  const haystack = (item: Item) => [item.name, item.latin, ...(item.aliases ?? [])];

  it('returns everything for an empty query', () => {
    expect(searchItems(ITEMS, '', haystack)).toHaveLength(4);
    expect(searchItems(ITEMS, '   ', haystack)).toHaveLength(4);
  });

  it('matches a substring of the name', () => {
    const result = searchItems(ITEMS, 'монст', haystack);
    expect(result.map((item) => item.name)).toEqual(['Монстера']);
  });

  it('ignores case', () => {
    expect(searchItems(ITEMS, 'МОНСТЕРА', haystack)).toHaveLength(1);
  });

  it('matches the latin name', () => {
    const result = searchItems(ITEMS, 'peperomioides', haystack);
    expect(result.map((item) => item.name)).toEqual(['Пилея']);
  });

  it('matches an alias', () => {
    const result = searchItems(ITEMS, 'слоновье', haystack);
    expect(result.map((item) => item.name)).toEqual(['Алоказия']);
  });

  it('treats е and ё as the same letter in both directions', () => {
    expect(searchItems(ITEMS, 'пилёя', haystack).map((i) => i.name)).toEqual(['Пилея']);
    expect(searchItems(ITEMS, 'слоновьё ухо', haystack).map((i) => i.name)).toEqual(['Алоказия']);
    expect(searchItems(ITEMS, 'слоновье ухо', haystack).map((i) => i.name)).toEqual(['Алоказия']);
  });

  it('returns nothing when there is no match', () => {
    expect(searchItems(ITEMS, 'кактус', haystack)).toEqual([]);
  });
});
