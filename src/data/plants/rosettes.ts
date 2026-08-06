import { PlantModel } from '../../types/plantModel';
import { rosette } from './shapes';

/**
 * Plants whose leaves rise straight out of the base with no petiole. The old portraits drew
 * sansevieria, dracaena, chlorophytum and tillandsia from the same `strap` leaf, which made four
 * unrelated species look identical. What actually separates them: how stiff the leaf is, how far
 * it arches, and what runs along it — cross bands, a pale rim, or a pale centre.
 */

export const sansevieria: PlantModel = {
  pot: { style: 'straight', width: 32, height: 26 },
  maturation: 0.32,
  organs: rosette(
    [
      // Stiff upright spears: barely any arch, barely any spread
      { length: 82, splay: 9 },
      { length: 86, splay: 7 },
      { length: 74, splay: 14 },
      { length: 68, splay: 5 },
      { length: 58, splay: 18 },
      { length: 48, splay: 4 },
    ],
    { blade: 'linear', ratio: 0.17, variegation: 'band' }
  ),
  stages: [
    { at: 0.05, label: 'Лист-черенок', note: 'Кусок листа, поставленный в грунт, даёт корни и новый побег.' },
    { at: 0.35, label: 'Молодое', note: 'Растёт медленно: пара новых листьев за сезон — норма.' },
    { at: 0.7, label: 'Взрослое', note: 'Поперечные полосы — рисунок самого листа, а не подсветка.' },
    { at: 1, label: 'Крупное', note: 'Новые побеги идут от корневища и со временем заполняют горшок.' },
  ],
};

export const chlorophytum: PlantModel = {
  pot: { style: 'hanging', width: 34, height: 20 },
  maturation: 0.26,
  organs: rosette(
    [
      // Soft leaves that arch right over — the opposite of a sansevieria
      { length: 66, splay: 20, arch: 0.5 },
      { length: 68, splay: 17, arch: 0.48 },
      { length: 60, splay: 14, arch: 0.42 },
      { length: 53, splay: 11, arch: 0.35 },
      { length: 46, splay: 7, arch: 0.26 },
      { length: 37, splay: 3, arch: 0.16 },
    ],
    { blade: 'linear', ratio: 0.14, variegation: 'midstripe' }
  ),
  stages: [
    { at: 0.05, label: 'Детка', note: 'Размножается детками, которые растут на цветоносах.' },
    { at: 0.35, label: 'Молодое', note: 'Листья пока короткие и стоят прямее, чем у взрослого.' },
    { at: 0.7, label: 'Взрослое', note: 'Светлая полоса по центру листа — признак сорта vittatum.' },
    { at: 1, label: 'Крупное', note: 'Утолщения на корнях запасают воду, поэтому пересушку переносит.' },
  ],
};

export const aloeVera: PlantModel = {
  pot: { style: 'tapered', width: 34, height: 24 },
  maturation: 0.3,
  organs: rosette(
    [
      // Thick wedges, widest at the base, spread wide with age
      { length: 56, splay: 42, arch: 0.10 },
      { length: 58, splay: 36, arch: 0.08 },
      { length: 50, splay: 28, arch: 0.10 },
      { length: 46, splay: 20, arch: 0.06 },
      { length: 38, splay: 12, arch: 0.06 },
      { length: 30, splay: 5 },
    ],
    { blade: 'lanceolate', ratio: 0.24, variegation: 'spot' }
  ),
  stages: [
    { at: 0.05, label: 'Детка', note: 'Отсаживают боковые отростки от материнской розетки.' },
    { at: 0.35, label: 'Молодое', note: 'Молодые листья стоят вертикально и заметно светлее.' },
    { at: 0.7, label: 'Взрослое', note: 'Лист запасает воду, поэтому поливают редко и после просушки.' },
    { at: 1, label: 'Крупное', note: 'Старые листья расходятся почти горизонтально, новые идут из центра.' },
  ],
};

export const tillandsia: PlantModel = {
  // No pot: an air plant sits on bark or a stand, roots only hold it in place
  maturation: 0.3,
  organs: rosette(
    [
      { length: 56, splay: 36, arch: 0.30 },
      { length: 58, splay: 31, arch: 0.28 },
      { length: 52, splay: 25, arch: 0.24 },
      { length: 47, splay: 19, arch: 0.20 },
      { length: 41, splay: 13, arch: 0.15 },
      { length: 33, splay: 6, arch: 0.10 },
    ],
    { blade: 'linear', ratio: 0.1 }
  ),
  stages: [
    { at: 0.05, label: 'Детка', note: 'Отделяют детку, когда она дорастёт до половины материнской.' },
    { at: 0.35, label: 'Молодое', note: 'Корней почти нет: воду и питание лист берёт сам.' },
    { at: 0.7, label: 'Взрослое', note: 'Серый налёт на листьях — чешуйки, которыми она ловит влагу.' },
    { at: 1, label: 'Крупное', note: 'После цветения материнская розетка отмирает, оставив детки.' },
  ],
};

export const dracaena: PlantModel = {
  pot: { style: 'straight', width: 34, height: 24 },
  maturation: 0.3,
  organs: [
    // A bare cane with all the leaves in a crown at the top — not a rosette from the soil
    { kind: 'stem', age: 0, from: [0, 1], to: [1, 26], bow: -2, thick: 4 },
    { kind: 'stem', age: 0.3, from: [1, 26], to: [3, 46], bow: 2, thick: 3.4 },
    { kind: 'stem', age: 0.6, from: [3, 46], to: [4, 60], bow: 1, thick: 3 },
    ...rosette(
      [
        { length: 40, splay: 38, arch: 0.30 },
        { length: 42, splay: 33, arch: 0.28 },
        { length: 39, splay: 28, arch: 0.26 },
        { length: 37, splay: 22, arch: 0.22 },
        { length: 35, splay: 17, arch: 0.18 },
        { length: 32, splay: 12, arch: 0.14 },
        { length: 29, splay: 7, arch: 0.10 },
        { length: 26, splay: 3, arch: 0.06 },
      ],
      { blade: 'linear', ratio: 0.15, variegation: 'margin' }
    ).map((leaf, i) => ({
      // Lifted onto the top of the cane, and appearing only once the cane has grown
      ...leaf,
      at: [leaf.at[0] + 4, 60] as [number, number],
      age: 0.1 + (i / 8) * 0.78,
    })),
  ],
  stages: [
    { at: 0.05, label: 'Черенок', note: 'Размножается отрезком ствола — он даёт корни и новую макушку.' },
    { at: 0.35, label: 'Молодое', note: 'Пока ствол короткий, пучок листьев сидит почти у земли.' },
    { at: 0.7, label: 'Взрослое', note: 'Ствол оголяется снизу: старые листья опадают, это часть роста.' },
    { at: 1, label: 'Крупное', note: 'Светлая кайма по краю листа — признак сорта marginata.' },
  ],
};
