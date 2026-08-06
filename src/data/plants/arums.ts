import { LeafOrgan, PlantModel } from '../../types/plantModel';
import { clump } from './shapes';

/**
 * Aroids that grow as a clump of long-stalked leaves: monstera, alocasia, spathiphyllum,
 * anthurium. The old generative portraits drew alocasia and anthurium identically, so the
 * separating features are drawn explicitly here — the fenestrations, the pale veins, the spathe.
 */

/** A spathe on its own stalk. The flower, not the leaf, is what identifies these two. */
function spathe(values: {
  age: number;
  angle: number;
  length: number;
  petiole: number;
  colour: 'pale' | 'warm';
}): LeafOrgan {
  return {
    kind: 'leaf',
    age: values.age,
    at: [0, 2],
    angle: values.angle,
    length: values.length,
    ratio: 0.56,
    petiole: values.petiole,
    tipBend: values.angle > 0 ? 8 : -8,
    blade: 'cordate',
    bloom: values.colour,
  };
}

export const monsteraDeliciosa: PlantModel = {
  pot: { style: 'straight', width: 44, height: 26 },
  maturation: 0.3,
  organs: clump(
    [
      { length: 44, petiole: 34, splay: 32, tipBend: 12 },
      { length: 46, petiole: 40, splay: 28, tipBend: 10 },
      { length: 42, petiole: 30, splay: 20, tipBend: 14 },
      { length: 40, petiole: 46, splay: 16, tipBend: 10 },
      { length: 34, petiole: 40, splay: 9, tipBend: 8 },
    ],
    { blade: 'fenestrate', veins: 'pinnate' }
  ),
  stages: [
    { at: 0.05, label: 'Черенок', note: 'Первые листья цельные, без прорезей — это не брак.' },
    { at: 0.35, label: 'Молодое', note: 'Прорези появляются, когда лист вырастает достаточно большим.' },
    { at: 0.7, label: 'Взрослое', note: 'Чем больше света, тем больше окон в листе.' },
    { at: 1, label: 'Крупное', note: 'Со временем нужна опора: собственный стебель лист уже не держит.' },
  ],
};

export const alocasia: PlantModel = {
  pot: { style: 'straight', width: 36, height: 24 },
  maturation: 0.28,
  organs: clump(
    [
      // Held up on stiff stalks, blades pointing outward and slightly down
      { length: 36, petiole: 40, splay: 26, tipBend: 16 },
      { length: 37, petiole: 46, splay: 22, tipBend: 14 },
      { length: 34, petiole: 36, splay: 15, tipBend: 18 },
      { length: 32, petiole: 50, splay: 11, tipBend: 12 },
      { length: 28, petiole: 44, splay: 6, tipBend: 10 },
    ],
    { blade: 'sagittate', ratio: 0.6, veins: 'pinnate', variegation: 'light-veins' }
  ),
  stages: [
    { at: 0.05, label: 'Клубенёк', note: 'Размножается детками-клубеньками у корня.' },
    { at: 0.35, label: 'Молодое', note: 'Новый лист выходит свёрнутой трубкой и разворачивается за несколько дней.' },
    { at: 0.7, label: 'Взрослое', note: 'Светлые жилки на тёмном фоне — узнаваемый признак рода.' },
    { at: 1, label: 'Крупное', note: 'Часто сбрасывает старый лист, когда разворачивает новый: обмен, не болезнь.' },
  ],
};

export const spathiphyllum: PlantModel = {
  pot: { style: 'straight', width: 38, height: 24 },
  maturation: 0.26,
  organs: [
    ...clump(
      [
        { length: 36, petiole: 30, splay: 34, tipBend: 14 },
        { length: 37, petiole: 34, splay: 30, tipBend: 12 },
        { length: 34, petiole: 26, splay: 22, tipBend: 16 },
        { length: 33, petiole: 38, splay: 16, tipBend: 12 },
        { length: 30, petiole: 32, splay: 9, tipBend: 10 },
      ],
      { blade: 'elliptic', ratio: 0.42, veins: 'pinnate' }
    ),
    // The spathe comes late: a young plant does not flower
    spathe({ age: 0.72, angle: -6, length: 20, petiole: 52, colour: 'pale' }),
    spathe({ age: 0.9, angle: 9, length: 18, petiole: 46, colour: 'pale' }),
  ],
  stages: [
    { at: 0.05, label: 'Делёнка', note: 'Черенком не размножается — делением куста.' },
    { at: 0.35, label: 'Молодое', note: 'Листья на черешках прямо от основания, стебля над землёй нет.' },
    { at: 0.7, label: 'Взрослое', note: 'Первое белое покрывало появляется, когда куст набрал объём.' },
    { at: 1, label: 'Крупное', note: 'Белое — не лепесток, а покрывало-лист вокруг соцветия.' },
  ],
};

export const anthurium: PlantModel = {
  pot: { style: 'straight', width: 36, height: 23 },
  maturation: 0.26,
  organs: [
    ...clump(
      [
        { length: 30, petiole: 30, splay: 30, tipBend: 14 },
        { length: 31, petiole: 34, splay: 26, tipBend: 12 },
        { length: 28, petiole: 26, splay: 18, tipBend: 16 },
        { length: 27, petiole: 36, splay: 12, tipBend: 12 },
      ],
      { blade: 'cordate', ratio: 0.58, veins: 'pinnate' }
    ),
    spathe({ age: 0.62, angle: -8, length: 21, petiole: 44, colour: 'warm' }),
    spathe({ age: 0.86, angle: 10, length: 19, petiole: 38, colour: 'warm' }),
  ],
  stages: [
    { at: 0.05, label: 'Делёнка', note: 'Отсаживают боковые побеги с корнями.' },
    { at: 0.35, label: 'Молодое', note: 'Пока листьев мало, цветения не будет — куст набирает силу.' },
    { at: 0.7, label: 'Взрослое', note: 'Красное покрывало плотное и восковое, держится месяцами.' },
    { at: 1, label: 'Крупное', note: 'Корни любят воздух: в плотном грунте цветение прекращается.' },
  ],
};

export const anthuriumCrystallinum: PlantModel = {
  pot: { style: 'straight', width: 38, height: 24 },
  maturation: 0.3,
  organs: clump(
    [
      // Big velvety hearts held almost flat, the pale veins forming a network
      { length: 40, petiole: 36, splay: 36, tipBend: 22 },
      { length: 41, petiole: 42, splay: 30, tipBend: 20 },
      { length: 37, petiole: 32, splay: 21, tipBend: 24 },
      { length: 34, petiole: 46, splay: 13, tipBend: 16 },
      { length: 29, petiole: 40, splay: 7, tipBend: 12 },
    ],
    { blade: 'cordate', ratio: 0.82, veins: 'pinnate', variegation: 'light-veins' }
  ),
  stages: [
    { at: 0.05, label: 'Делёнка', note: 'Размножается делением, семена дают всходы медленно.' },
    { at: 0.35, label: 'Молодое', note: 'Молодой лист коричневатый и мягкий, зелёным становится позже.' },
    { at: 0.7, label: 'Взрослое', note: 'Рисунок жилок проявляется в полную силу на крупных листьях.' },
    { at: 1, label: 'Крупное', note: 'Бархат листа не терпит воды: капли оставляют пятна.' },
  ],
};
