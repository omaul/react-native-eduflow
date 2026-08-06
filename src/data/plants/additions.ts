import { FrondOrgan, PlantModel, PlantOrgan } from '../../types/plantModel';
import { clump, rosette, vine } from './shapes';

/**
 * The species added alongside the original catalogue. Each one is drawn from the same three
 * architectures as its relatives, so what tells them apart inside a genus is the blade: a
 * monstera adansonii's closed holes against the deliciosa's open splits, an orbifolia's round
 * banded leaf against the plain calathea, a birkin's pinstripes against a plain philodendron.
 */

const TRAIL: [number, number][] = [
  [-8, 1],
  [-7, 20],
  [-3, 38],
  [4, 54],
  [13, 66],
  [21, 76],
  [26, 84],
];

export const monsteraAdansonii: PlantModel = {
  pot: { style: 'hanging', width: 34, height: 20 },
  maturation: 0.24,
  organs: vine(
    TRAIL,
    [
      { length: 32, angle: 64, petiole: 9 },
      { length: 31, angle: 68, petiole: 8 },
      { length: 29, angle: 70, petiole: 8 },
      { length: 26, angle: 74, petiole: 7 },
      { length: 23, angle: 78, petiole: 6 },
      { length: 19, angle: 82, petiole: 5 },
    ],
    { blade: 'fenestrate', ratio: 0.62, veins: 'pinnate' }
  ),
  stages: [
    { at: 0.05, label: 'Черенок', note: 'Узел с одним листом укореняется в воде за две-три недели.' },
    { at: 0.35, label: 'Молодое', note: 'Первые листья могут быть без дыр — они появятся на крупных.' },
    { at: 0.7, label: 'Взрослое', note: 'Отверстия закрытые: до края листа они не доходят.' },
    { at: 1, label: 'Крупное', note: 'На опоре лист крупнее и дырок в нём больше, чем на свисающей лозе.' },
  ],
};

export const philodendronBirkin: PlantModel = {
  pot: { style: 'straight', width: 32, height: 22 },
  maturation: 0.26,
  organs: clump(
    [
      { length: 28, petiole: 16, splay: 34, tipBend: 14 },
      { length: 29, petiole: 20, splay: 29, tipBend: 12 },
      { length: 27, petiole: 13, splay: 21, tipBend: 16 },
      { length: 25, petiole: 22, splay: 14, tipBend: 12 },
      { length: 22, petiole: 18, splay: 7, tipBend: 10 },
    ],
    { blade: 'elliptic', ratio: 0.58, veins: 'pinnate', variegation: 'stripe' }
  ),
  stages: [
    { at: 0.05, label: 'Черенок', note: 'Размножается стеблевым черенком с узлом.' },
    { at: 0.35, label: 'Молодое', note: 'На молодых листьях штрихов почти нет.' },
    { at: 0.7, label: 'Взрослое', note: 'Белые штрихи идут по жилкам и на каждом листе разные.' },
    { at: 1, label: 'Крупное', note: 'Куст остаётся компактным: лозой биркин не растёт.' },
  ],
};

export const anthuriumClarinervium: PlantModel = {
  pot: { style: 'straight', width: 36, height: 23 },
  maturation: 0.3,
  organs: clump(
    [
      { length: 34, petiole: 30, splay: 34, tipBend: 20 },
      { length: 35, petiole: 35, splay: 28, tipBend: 18 },
      { length: 32, petiole: 26, splay: 20, tipBend: 22 },
      { length: 29, petiole: 38, splay: 12, tipBend: 16 },
      { length: 25, petiole: 32, splay: 6, tipBend: 12 },
    ],
    { blade: 'cordate', ratio: 0.88, veins: 'palmate', variegation: 'light-veins' }
  ),
  stages: [
    { at: 0.05, label: 'Делёнка', note: 'Размножается делением куста.' },
    { at: 0.35, label: 'Молодое', note: 'Лист сначала мягкий и светлый, тёмным становится позже.' },
    { at: 0.7, label: 'Взрослое', note: 'Жилки образуют широкую белую сетку по всему листу.' },
    { at: 1, label: 'Крупное', note: 'Лист жёсткий и кожистый — воду переносит легче бархатных родственников.' },
  ],
};

export const alocasiaZebrina: PlantModel = {
  pot: { style: 'straight', width: 34, height: 24 },
  maturation: 0.28,
  organs: clump(
    [
      // Narrow arrows on very long stalks: the plant is mostly petiole
      { length: 30, petiole: 56, splay: 24, tipBend: 22 },
      { length: 31, petiole: 62, splay: 20, tipBend: 20 },
      { length: 28, petiole: 50, splay: 14, tipBend: 24 },
      { length: 26, petiole: 66, splay: 9, tipBend: 18 },
      { length: 22, petiole: 58, splay: 4, tipBend: 14 },
    ],
    { blade: 'sagittate', ratio: 0.46, veins: 'pinnate' }
  ),
  stages: [
    { at: 0.05, label: 'Клубенёк', note: 'Размножается детками-клубеньками.' },
    { at: 0.35, label: 'Молодое', note: 'Черешки короткие; вытягиваются они позже.' },
    { at: 0.7, label: 'Взрослое', note: 'Полоски — на черешке, сам лист однотонный.' },
    { at: 1, label: 'Крупное', note: 'Может сбросить все листья и уйти в покой: клубень при этом жив.' },
  ],
};

export const calatheaOrbifolia: PlantModel = {
  pot: { style: 'straight', width: 40, height: 25 },
  maturation: 0.28,
  organs: clump(
    [
      { length: 34, petiole: 32, splay: 32, tipBend: 12 },
      { length: 35, petiole: 37, splay: 27, tipBend: 10 },
      { length: 32, petiole: 27, splay: 19, tipBend: 14 },
      { length: 30, petiole: 42, splay: 13, tipBend: 10 },
      { length: 26, petiole: 35, splay: 6, tipBend: 8 },
    ],
    { blade: 'orbicular', ratio: 0.94, veins: 'pinnate', variegation: 'stripe' }
  ),
  stages: [
    { at: 0.05, label: 'Делёнка', note: 'Только делением куста — черенком не размножается.' },
    { at: 0.35, label: 'Молодое', note: 'Новый лист выходит трубочкой из центра.' },
    { at: 0.7, label: 'Взрослое', note: 'Лист почти круглый — этим орбифолия отличается от остальных калатей.' },
    { at: 1, label: 'Крупное', note: 'На жёсткую воду отвечает бурым краем листа.' },
  ],
};

export const aglaonema: PlantModel = {
  pot: { style: 'straight', width: 34, height: 23 },
  maturation: 0.28,
  organs: clump(
    [
      { length: 32, petiole: 18, splay: 36, tipBend: 16 },
      { length: 33, petiole: 23, splay: 30, tipBend: 14 },
      { length: 30, petiole: 14, splay: 22, tipBend: 18 },
      { length: 28, petiole: 25, splay: 15, tipBend: 14 },
      { length: 25, petiole: 20, splay: 8, tipBend: 10 },
    ],
    { blade: 'elliptic', ratio: 0.44, veins: 'pinnate', variegation: 'midstripe' }
  ),
  stages: [
    { at: 0.05, label: 'Черенок', note: 'Укореняется черенком или отделением побега.' },
    { at: 0.35, label: 'Молодое', note: 'Листья идут прямо от основания плотным пучком.' },
    { at: 0.7, label: 'Взрослое', note: 'Светлый центр держится даже в полутени.' },
    { at: 1, label: 'Крупное', note: 'Со временем оголяет короткий стволик у земли.' },
  ],
};

export const begoniaRex: PlantModel = {
  pot: { style: 'straight', width: 34, height: 22 },
  maturation: 0.26,
  organs: clump(
    [
      { length: 30, petiole: 20, splay: 40, tipBend: 20 },
      { length: 31, petiole: 25, splay: 34, tipBend: 18 },
      { length: 28, petiole: 16, splay: 25, tipBend: 22 },
      { length: 26, petiole: 27, splay: 16, tipBend: 16 },
      { length: 23, petiole: 22, splay: 9, tipBend: 12 },
    ],
    { blade: 'wing', ratio: 0.8, veins: 'palmate', variegation: 'light-veins' }
  ),
  stages: [
    { at: 0.05, label: 'Лист', note: 'Размножается фрагментом листа: из надреза на жилке идут новые растения.' },
    { at: 0.35, label: 'Молодое', note: 'Рисунок виден уже на первых листьях.' },
    { at: 0.7, label: 'Взрослое', note: 'Половинки листа неравны — признак рода, а не повреждение.' },
    { at: 1, label: 'Крупное', note: 'Цветы мелкие и невзрачные: сорт выведен ради листа.' },
  ],
};

export const ficusLyrata: PlantModel = {
  pot: { style: 'straight', width: 40, height: 27 },
  maturation: 0.3,
  organs: [
    { kind: 'stem', age: 0, from: [0, 1], to: [-1, 24], bow: 2, thick: 5 },
    { kind: 'stem', age: 0.24, from: [-1, 24], to: [1, 46], bow: -2, thick: 4.4 },
    { kind: 'stem', age: 0.5, from: [1, 46], to: [0, 66], bow: 2, thick: 3.8 },
    { kind: 'stem', age: 0.74, from: [0, 66], to: [2, 82], bow: -1, thick: 3.2 },
    ...[
      { age: 0, at: [-1, 22] as [number, number], side: -1, length: 38 },
      { age: 0.24, at: [0, 36] as [number, number], side: 1, length: 37 },
      { age: 0.5, at: [1, 52] as [number, number], side: -1, length: 34 },
      { age: 0.74, at: [1, 68] as [number, number], side: 1, length: 30 },
      { age: 0.9, at: [2, 82] as [number, number], side: -1, length: 25 },
    ].map(
      (leaf, i): PlantOrgan => ({
        kind: 'leaf',
        age: leaf.age,
        at: leaf.at,
        angle: leaf.side * 48,
        // Broader than the elastica's blade — the fiddle outline, roughly
        length: leaf.length,
        ratio: 0.72,
        petiole: 6,
        bow: leaf.side * 2,
        tipBend: leaf.side * 12,
        blade: 'elliptic',
        veins: 'pinnate',
        tone: (i % 3) as 0 | 1 | 2,
      })
    ),
  ],
  stages: [
    { at: 0.05, label: 'Черенок', note: 'Верхушечный черенок с двумя листьями укореняется в воде.' },
    { at: 0.35, label: 'Молодое', note: 'Один ствол вверх, боковых ветвей сам не даёт.' },
    { at: 0.7, label: 'Взрослое', note: 'Лист жёсткий, с крупными вдавленными жилками.' },
    { at: 1, label: 'Крупное', note: 'Смену места переносит плохо: часто отвечает опадением листьев.' },
  ],
};

export const dracaenaFragrans: PlantModel = {
  pot: { style: 'straight', width: 36, height: 25 },
  maturation: 0.3,
  organs: [
    { kind: 'stem', age: 0, from: [0, 1], to: [1, 22], bow: -2, thick: 5.5 },
    { kind: 'stem', age: 0.3, from: [1, 22], to: [2, 40], bow: 2, thick: 4.8 },
    ...rosette(
      [
        // Wider and softer straps than the marginata's, arching well over
        { length: 46, splay: 26, arch: 0.4 },
        { length: 48, splay: 22, arch: 0.38 },
        { length: 44, splay: 18, arch: 0.34 },
        { length: 41, splay: 14, arch: 0.28 },
        { length: 37, splay: 10, arch: 0.22 },
        { length: 32, splay: 5, arch: 0.14 },
      ],
      { blade: 'linear', ratio: 0.26, variegation: 'midstripe' }
    ).map((leaf, i) => ({
      ...leaf,
      at: [leaf.at[0] + 2, 40] as [number, number],
      age: 0.1 + (i / 6) * 0.76,
    })),
  ],
  stages: [
    { at: 0.05, label: 'Черенок', note: 'Размножается отрезком ствола.' },
    { at: 0.35, label: 'Молодое', note: 'Пучок листьев сидит почти у земли, пока ствол короткий.' },
    { at: 0.7, label: 'Взрослое', note: 'Лист шире и мягче, чем у маргинаты, со светлой полосой по центру.' },
    { at: 1, label: 'Крупное', note: 'Обрезанный ствол даёт две-три новые макушки.' },
  ],
};

export const hoyaKerrii: PlantModel = {
  pot: { style: 'straight', width: 30, height: 21 },
  maturation: 0.3,
  organs: vine(
    [
      [0, 1],
      [0, 16],
      [2, 30],
      [5, 42],
      [9, 52],
    ],
    [
      // Thick hearts, held almost flat against the stem
      { length: 24, angle: 58, petiole: 4, tipBend: 4 },
      { length: 23, angle: 62, petiole: 4, tipBend: 4 },
      { length: 21, angle: 66, petiole: 3, tipBend: 4 },
      { length: 19, angle: 70, petiole: 3, tipBend: 4 },
    ],
    { blade: 'cordate', ratio: 0.9, veins: 'midrib' },
    { thick: 2.2 }
  ),
  stages: [
    { at: 0.05, label: 'Один лист', note: 'Часто продаётся одним листом: без узла побега он не даст.' },
    { at: 0.35, label: 'Молодое', note: 'Из узла идёт первый побег — с него и начинается растение.' },
    { at: 0.7, label: 'Взрослое', note: 'Лист толстый и запасает воду, поэтому полив редкий.' },
    { at: 1, label: 'Крупное', note: 'Растёт медленно: пара листьев за сезон — норма.' },
  ],
};

export const peperomiaArgyreia: PlantModel = {
  pot: { style: 'straight', width: 32, height: 22 },
  maturation: 0.26,
  organs: clump(
    [
      { length: 24, petiole: 26, splay: 38, tipBend: 0 },
      { length: 25, petiole: 31, splay: 32, tipBend: 0 },
      { length: 23, petiole: 21, splay: 23, tipBend: 0 },
      { length: 21, petiole: 34, splay: 15, tipBend: 0 },
      { length: 19, petiole: 28, splay: 8, tipBend: 0 },
    ],
    { blade: 'peltate', veins: 'palmate', variegation: 'stripe' }
  ),
  stages: [
    { at: 0.05, label: 'Черенок', note: 'Размножается листом с кусочком черешка.' },
    { at: 0.35, label: 'Молодое', note: 'Полосы видны с первого листа.' },
    { at: 0.7, label: 'Взрослое', note: 'Черешок крепится к середине листа снизу.' },
    { at: 1, label: 'Крупное', note: 'Полосы — окраска между жилками, а не сами жилки.' },
  ],
};

/** Boston fern: many soft pinnate fronds arching out of a dense crown */
function bostonFrond(values: {
  age: number;
  angle: number;
  splay: number;
  length: number;
  bow: number;
  tone: 0 | 1 | 2;
}): FrondOrgan {
  return {
    kind: 'frond',
    age: values.age,
    at: [0, 1],
    angle: values.angle,
    splay: values.splay,
    length: values.length,
    bow: values.bow,
    pairs: 9,
    leaflet: 11,
    leafletRatio: 0.42,
    taper: 0.5,
    bare: 0.12,
    pitch: 68,
    blade: 'lanceolate',
    veins: 'none',
    thick: 1.6,
    tone: values.tone,
  };
}

export const nephrolepis: PlantModel = {
  pot: { style: 'hanging', width: 34, height: 20 },
  maturation: 0.26,
  organs: [
    bostonFrond({ age: 0, angle: -14, splay: -40, length: 62, bow: -14, tone: 0 }),
    bostonFrond({ age: 0.13, angle: 15, splay: 36, length: 64, bow: 14, tone: 1 }),
    bostonFrond({ age: 0.29, angle: -13, splay: -29, length: 57, bow: -12, tone: 2 }),
    bostonFrond({ age: 0.44, angle: 14, splay: 24, length: 53, bow: 11, tone: 0 }),
    bostonFrond({ age: 0.6, angle: -11, splay: -17, length: 47, bow: -9, tone: 1 }),
    bostonFrond({ age: 0.75, angle: 12, splay: 13, length: 42, bow: 8, tone: 2 }),
    bostonFrond({ age: 0.88, angle: -8, splay: -7, length: 35, bow: -6, tone: 0 }),
  ],
  stages: [
    { at: 0.05, label: 'Делёнка', note: 'Проще всего размножать делением куста.' },
    { at: 0.35, label: 'Молодое', note: 'Новый лист разворачивается из закрученной спирали.' },
    { at: 0.7, label: 'Взрослое', note: 'Куст растёт во все стороны и заполняет кашпо.' },
    { at: 1, label: 'Крупное', note: 'В сухом воздухе осыпаются мелкие листочки, а не желтеют целые ветви.' },
  ],
};

export const asplenium: PlantModel = {
  pot: { style: 'straight', width: 34, height: 23 },
  maturation: 0.3,
  organs: rosette(
    [
      // Whole, undivided blades standing in a funnel — unlike every other fern here
      { length: 62, splay: 26, arch: 0.24 },
      { length: 64, splay: 22, arch: 0.22 },
      { length: 58, splay: 17, arch: 0.19 },
      { length: 52, splay: 13, arch: 0.15 },
      { length: 45, splay: 8, arch: 0.11 },
      { length: 36, splay: 4, arch: 0.07 },
    ],
    { blade: 'linear', ratio: 0.3, veins: 'midrib' }
  ),
  stages: [
    { at: 0.05, label: 'Сеянец', note: 'Размножается спорами: способ медленный и редко домашний.' },
    { at: 0.35, label: 'Молодое', note: 'Листья цельные с самого начала — они не рассекаются с возрастом.' },
    { at: 0.7, label: 'Взрослое', note: 'Из центра воронки выходит новый лист, свёрнутый спиралью.' },
    { at: 1, label: 'Крупное', note: 'Воду в центр воронки не льют: там точка роста.' },
  ],
};

export const echeveria: PlantModel = {
  pot: { style: 'tapered', width: 32, height: 18 },
  maturation: 0.34,
  organs: rosette(
    [
      // A tight, flat rosette: the outer leaves lie almost horizontal
      { length: 26, splay: 62 },
      { length: 26, splay: 56 },
      { length: 24, splay: 46 },
      { length: 22, splay: 36 },
      { length: 20, splay: 26 },
      { length: 17, splay: 16 },
      { length: 14, splay: 8 },
    ],
    { blade: 'lanceolate', ratio: 0.42 }
  ),
  stages: [
    { at: 0.05, label: 'Лист', note: 'Отломанный лист на сухом грунте даёт корни и новую розетку.' },
    { at: 0.35, label: 'Молодое', note: 'Розетка плотная, листья стоят почти вертикально.' },
    { at: 0.7, label: 'Взрослое', note: 'Старые листья ложатся наружу, новые идут из центра.' },
    { at: 1, label: 'Крупное', note: 'Восковой налёт стирается пальцами и не восстанавливается.' },
  ],
};

export const haworthia: PlantModel = {
  pot: { style: 'straight', width: 28, height: 18 },
  maturation: 0.32,
  organs: rosette(
    [
      { length: 34, splay: 36 },
      { length: 35, splay: 31 },
      { length: 32, splay: 25 },
      { length: 29, splay: 19 },
      { length: 25, splay: 13 },
      { length: 21, splay: 7 },
    ],
    { blade: 'lanceolate', ratio: 0.3, variegation: 'band' }
  ),
  stages: [
    { at: 0.05, label: 'Детка', note: 'Отсаживают боковые детки от материнской розетки.' },
    { at: 0.35, label: 'Молодое', note: 'Розетка компактная и растёт медленно.' },
    { at: 0.7, label: 'Взрослое', note: 'Белые поперечные полоски — рисунок самого листа.' },
    { at: 1, label: 'Крупное', note: 'Прямое солнце ей не нужно, в отличие от большинства суккулентов.' },
  ],
};

export const tradescantia: PlantModel = {
  pot: { style: 'hanging', width: 32, height: 19 },
  maturation: 0.2,
  organs: vine(
    TRAIL,
    [
      // Small pointed leaves crowded along a soft stem
      { length: 20, angle: 70, petiole: 3, tipBend: 8 },
      { length: 20, angle: 74, petiole: 3, tipBend: 8 },
      { length: 19, angle: 76, petiole: 2, tipBend: 6 },
      { length: 18, angle: 78, petiole: 2, tipBend: 6 },
      { length: 16, angle: 82, petiole: 2, tipBend: 6 },
      { length: 14, angle: 84, petiole: 2, tipBend: 4 },
    ],
    { blade: 'elliptic', ratio: 0.44, variegation: 'midstripe' },
    { thick: 1.8 }
  ),
  stages: [
    { at: 0.05, label: 'Черенок', note: 'Черенок в воде даёт корни за считаные дни.' },
    { at: 0.35, label: 'Молодое', note: 'Растёт быстро: побег удлиняется за недели, не за месяцы.' },
    { at: 0.7, label: 'Взрослое', note: 'Светлые полосы по листу — окраска, а не жилки.' },
    { at: 1, label: 'Крупное', note: 'Оголяется у основания, поэтому её регулярно обрезают и переукореняют.' },
  ],
};
