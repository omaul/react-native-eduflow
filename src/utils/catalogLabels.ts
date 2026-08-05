/**
 * Human-readable labels and the field/filter specs that drive the catalog pages.
 *
 * ADDING A NEW PARAMETER:
 *   1. add the field to the type in src/types/catalog.ts
 *   2. add it to the data in public/content/.../catalog.json
 *   3. add one entry to PLANT_FIELDS / COMPONENT_FIELDS below — it starts rendering
 *   4. optionally add a FilterSpec to make it filterable
 * No page component needs to change.
 */

import {
  ComponentRole,
  FractionSize,
  GrowthRate,
  Level,
  LightLevel,
  PhEffect,
  Plant,
  Rarity,
  RootSize,
  SubstrateComponent,
  Thermal,
  WaterMode,
} from '../types/catalog';
import { FilterSpec } from './catalog';

// ===== Dictionaries =====

export const LIGHT_LABELS: Record<LightLevel, string> = {
  shade: 'Тень',
  partial: 'Полутень',
  'bright-indirect': 'Яркий рассеянный',
  direct: 'Прямое солнце',
};

export const WATER_LABELS: Record<WaterMode, string> = {
  'keep-moist': 'Всегда слегка влажный',
  'dry-top': 'Просушка верхнего слоя',
  'dry-through': 'Полная просушка',
};

export const LEVEL_LABELS: Record<Level, string> = {
  low: 'Низкая',
  medium: 'Средняя',
  high: 'Высокая',
};

export const ROOT_LABELS: Record<RootSize, string> = {
  fine: 'Тонкие',
  medium: 'Средние',
  thick: 'Крупные, мясистые',
};

export const FRACTION_LABELS: Record<FractionSize, string> = {
  fine: 'Мелкая',
  medium: 'Средняя',
  coarse: 'Крупная',
};

export const RARITY_LABELS: Record<Rarity, string> = {
  common: 'Обычное',
  interesting: 'Интересное',
  rare: 'Редкое',
};

export const GROWTH_LABELS: Record<GrowthRate, string> = {
  slow: 'Медленный',
  medium: 'Умеренный',
  fast: 'Быстрый',
};

export const DIFFICULTY_LABELS: Record<number, string> = {
  1: 'Очень устойчивое',
  2: 'Простое',
  3: 'Среднее',
  4: 'Требует внимания',
  5: 'Для опытных',
};

export const ROLE_LABELS: Record<ComponentRole, string> = {
  aerator: 'Разрыхлитель',
  retainer: 'Влагоудерживатель',
  mineral: 'Минеральная добавка',
  nutrition: 'Питание',
  antiseptic: 'Антисептик',
};

export const PH_EFFECT_LABELS: Record<PhEffect, string> = {
  acidifies: 'Подкисляет',
  neutral: 'Не влияет на pH',
  alkalizes: 'Подщелачивает',
};

export const THERMAL_LABELS: Record<Thermal, string> = {
  cold: 'Холодный',
  neutral: 'Не холодный',
};

function range(pair?: [number, number], unit = ''): string | null {
  if (!pair) return null;
  return `${pair[0]}–${pair[1]}${unit}`;
}

// ===== Field specs (detail pages) =====

export interface FieldSpec<T> {
  label: string;
  value: (item: T) => string | null;
}

export const PLANT_FIELDS: FieldSpec<Plant>[] = [
  { label: 'Латинское название', value: (p) => p.latin },
  { label: 'Семейство', value: (p) => p.family ?? null },
  { label: 'Сложность', value: (p) => DIFFICULTY_LABELS[p.difficulty] ?? null },
  { label: 'Свет', value: (p) => LIGHT_LABELS[p.light] },
  { label: 'Полив', value: (p) => WATER_LABELS[p.water] },
  { label: 'Влажность воздуха', value: (p) => LEVEL_LABELS[p.humidity] },
  { label: 'Температура', value: (p) => range(p.temp, ' °C') },
  { label: 'Корни', value: (p) => (p.roots ? ROOT_LABELS[p.roots.size] : null) },
  { label: 'Фракция субстрата', value: (p) => (p.roots ? FRACTION_LABELS[p.roots.fraction] : null) },
  { label: 'Кислотность', value: (p) => range(p.substrate?.ph) },
  { label: 'Рост', value: (p) => (p.growth ? GROWTH_LABELS[p.growth] : null) },
  { label: 'Горшок', value: (p) => p.pot ?? null },
  { label: 'Размножение', value: (p) => p.propagation?.join(', ') ?? null },
  {
    label: 'Питомцы',
    value: (p) =>
      p.toxicToPets === undefined
        ? null
        : p.toxicToPets
          ? 'Токсично для кошек и собак'
          : 'Считается безопасным',
  },
];

export const COMPONENT_FIELDS: FieldSpec<SubstrateComponent>[] = [
  { label: 'Роль', value: (c) => c.roles.map((role) => ROLE_LABELS[role]).join(', ') },
  { label: 'Кислотность', value: (c) => range(c.ph) },
  { label: 'Влияние на pH', value: (c) => PH_EFFECT_LABELS[c.phEffect] },
  { label: 'Влагоудержание', value: (c) => LEVEL_LABELS[c.moisture] },
  { label: 'Аэрация', value: (c) => LEVEL_LABELS[c.aeration] },
  { label: 'Температура', value: (c) => THERMAL_LABELS[c.thermal] },
  { label: 'Фракции', value: (c) => c.fractions?.join(', ') ?? null },
  { label: 'Доля в смеси', value: (c) => c.share ?? null },
];

// ===== Filter specs (library pages) =====

export const PLANT_FILTERS: FilterSpec<Plant>[] = [
  {
    key: 'rarity',
    label: 'Насколько обычное',
    options: [
      { value: 'common', label: 'Обычные' },
      { value: 'interesting', label: 'Интересные' },
      { value: 'rare', label: 'Редкие' },
    ],
    match: (plant, value) => plant.rarity === value,
  },
  {
    key: 'difficulty',
    label: 'Сложность',
    options: [
      { value: 'easy', label: 'Устойчивые' },
      { value: 'medium', label: 'Средние' },
      { value: 'hard', label: 'Требовательные' },
    ],
    match: (plant, value) => {
      if (value === 'easy') return plant.difficulty <= 2;
      if (value === 'medium') return plant.difficulty === 3;
      return plant.difficulty >= 4;
    },
  },
  {
    key: 'light',
    label: 'Свет',
    options: [
      { value: 'shade', label: 'Тень' },
      { value: 'partial', label: 'Полутень' },
      { value: 'bright-indirect', label: 'Яркий рассеянный' },
      { value: 'direct', label: 'Прямое солнце' },
    ],
    match: (plant, value) => plant.light === value,
  },
  {
    key: 'water',
    label: 'Полив',
    options: [
      { value: 'keep-moist', label: 'Любит влажное' },
      { value: 'dry-top', label: 'Просушка верха' },
      { value: 'dry-through', label: 'Полная просушка' },
    ],
    match: (plant, value) => plant.water === value,
  },
  {
    key: 'roots',
    label: 'Фракция',
    options: [
      { value: 'fine', label: 'Мелкая' },
      { value: 'medium', label: 'Средняя' },
      { value: 'coarse', label: 'Крупная' },
    ],
    match: (plant, value) => plant.roots?.fraction === value,
  },
  {
    key: 'pets',
    label: 'Питомцы',
    options: [{ value: 'safe', label: 'Безопасно для кошек' }],
    match: (plant) => plant.toxicToPets === false,
  },
];

export const COMPONENT_FILTERS: FilterSpec<SubstrateComponent>[] = [
  {
    key: 'role',
    label: 'Роль',
    options: [
      { value: 'aerator', label: 'Разрыхлители' },
      { value: 'retainer', label: 'Влагоудерживатели' },
      { value: 'mineral', label: 'Минеральные добавки' },
      { value: 'nutrition', label: 'Питание' },
      { value: 'antiseptic', label: 'Антисептики' },
    ],
    match: (component, value) => component.roles.includes(value as ComponentRole),
  },
  {
    key: 'recommended',
    label: 'Рекомендация',
    options: [
      { value: 'yes', label: 'Стоит использовать' },
      { value: 'no', label: 'Лучше не использовать' },
    ],
    match: (component, value) => component.recommended === (value === 'yes'),
  },
  {
    key: 'ph',
    label: 'Влияние на pH',
    options: [
      { value: 'acidifies', label: 'Подкисляет' },
      { value: 'neutral', label: 'Нейтральный' },
      { value: 'alkalizes', label: 'Подщелачивает' },
    ],
    match: (component, value) => component.phEffect === value,
  },
  {
    key: 'thermal',
    label: 'Температура',
    options: [
      { value: 'neutral', label: 'Не холодный' },
      { value: 'cold', label: 'Холодный' },
    ],
    match: (component, value) => component.thermal === value,
  },
];

// ===== Search fields =====

export function plantHaystack(plant: Plant): (string | undefined)[] {
  return [plant.name, plant.latin, plant.family, plant.summary, ...(plant.aliases ?? []), ...(plant.tags ?? [])];
}

export function componentHaystack(component: SubstrateComponent): (string | undefined)[] {
  return [component.name, component.summary, ...(component.aliases ?? [])];
}
