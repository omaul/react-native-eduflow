import { FrondOrgan, PlantModel, PlantOrgan } from '../../types/plantModel';
import { clump } from './shapes';

/**
 * Species whose architecture does not fit the three shared shapes: a trunk carrying leaves, a
 * succulent shrub, a fern of wiry stalks, a pair of stones. Each is authored organ by organ.
 */

export const ficusElastica: PlantModel = {
  pot: { style: 'straight', width: 38, height: 26 },
  maturation: 0.3,
  organs: [
    // A stout single trunk. Few leaves, but each one large and thick.
    { kind: 'stem', age: 0, from: [0, 1], to: [-1, 22], bow: 2, thick: 5 },
    { kind: 'stem', age: 0.22, from: [-1, 22], to: [1, 42], bow: -2, thick: 4.4 },
    { kind: 'stem', age: 0.46, from: [1, 42], to: [0, 60], bow: 2, thick: 3.8 },
    { kind: 'stem', age: 0.7, from: [0, 60], to: [2, 74], bow: -1, thick: 3.2 },
    ...[
      { age: 0, at: [-1, 20] as [number, number], side: -1, length: 34 },
      { age: 0.22, at: [0, 34] as [number, number], side: 1, length: 33 },
      { age: 0.46, at: [1, 48] as [number, number], side: -1, length: 30 },
      { age: 0.7, at: [0, 62] as [number, number], side: 1, length: 27 },
      { age: 0.88, at: [2, 74] as [number, number], side: -1, length: 22 },
    ].map(
      (leaf, i): PlantOrgan => ({
        kind: 'leaf',
        age: leaf.age,
        at: leaf.at,
        angle: leaf.side * 52,
        length: leaf.length,
        ratio: 0.5,
        petiole: 7,
        bow: leaf.side * 2,
        tipBend: leaf.side * 14,
        blade: 'elliptic',
        veins: 'midrib',
        tone: (i % 3) as 0 | 1 | 2,
      })
    ),
  ],
  stages: [
    { at: 0.05, label: 'Черенок', note: 'Верхушечный черенок с двумя листьями укореняется в воде или грунте.' },
    { at: 0.35, label: 'Молодое', note: 'Растёт одним стволом вверх, ветвиться сам не спешит.' },
    { at: 0.7, label: 'Взрослое', note: 'Новый лист выходит из красноватого чехла, который потом опадает.' },
    { at: 1, label: 'Крупное', note: 'Чтобы пошли боковые ветки, макушку прищипывают.' },
  ],
};

export const crassula: PlantModel = {
  pot: { style: 'tapered', width: 30, height: 20 },
  maturation: 0.3,
  organs: [
    // A thick trunk that forks: a small tree built out of water-storing parts
    { kind: 'stem', age: 0, from: [0, 1], to: [0, 20], thick: 6 },
    { kind: 'stem', age: 0.16, from: [0, 20], to: [-11, 36], bow: -3, thick: 4.4 },
    { kind: 'stem', age: 0.28, from: [0, 20], to: [11, 34], bow: 3, thick: 4.4 },
    { kind: 'stem', age: 0.5, from: [-11, 36], to: [-19, 50], bow: -2, thick: 3.2 },
    { kind: 'stem', age: 0.6, from: [11, 34], to: [19, 48], bow: 2, thick: 3.2 },
    { kind: 'stem', age: 0.74, from: [0, 20], to: [1, 44], thick: 3.4 },
    ...[
      { age: 0.2, at: [-6, 28] as [number, number], size: 10 },
      { age: 0.22, at: [6, 27] as [number, number], size: 10 },
      { age: 0.34, at: [-11, 36] as [number, number], size: 11 },
      { age: 0.36, at: [11, 34] as [number, number], size: 11 },
      { age: 0.56, at: [-16, 44] as [number, number], size: 10 },
      { age: 0.58, at: [16, 42] as [number, number], size: 10 },
      { age: 0.66, at: [-19, 50] as [number, number], size: 9 },
      { age: 0.68, at: [19, 48] as [number, number], size: 9 },
      { age: 0.8, at: [1, 36] as [number, number], size: 10 },
      { age: 0.86, at: [1, 44] as [number, number], size: 9 },
    ].flatMap((node, i): PlantOrgan[] =>
      // Fleshy leaves sit in opposite pairs at every node along the branches
      [-1, 1].map((side) => ({
        kind: 'leaf',
        age: node.age,
        at: node.at,
        angle: side * 62,
        length: node.size,
        ratio: 0.74,
        petiole: 1,
        blade: 'elliptic',
        tone: (i % 3) as 0 | 1 | 2,
      }))
    ),
  ],
  stages: [
    { at: 0.05, label: 'Лист', note: 'Отломанный лист, положенный на грунт, даёт корни и новую розетку.' },
    { at: 0.35, label: 'Молодое', note: 'Сначала это один сочный побег без ветвей.' },
    { at: 0.7, label: 'Взрослое', note: 'Ствол утолщается и деревенеет — отсюда «денежное дерево».' },
    { at: 1, label: 'Крупное', note: 'Вода запасается в листьях, поэтому поливают только после просушки.' },
  ],
};

export const peperomia: PlantModel = {
  pot: { style: 'straight', width: 32, height: 22 },
  maturation: 0.24,
  organs: clump(
    [
      // A low mound of thick, almost round leaves on short stalks
      { length: 22, petiole: 12, splay: 42, tipBend: 12 },
      { length: 23, petiole: 15, splay: 36, tipBend: 10 },
      { length: 21, petiole: 10, splay: 26, tipBend: 14 },
      { length: 20, petiole: 17, splay: 18, tipBend: 10 },
      { length: 18, petiole: 13, splay: 11, tipBend: 8 },
      { length: 16, petiole: 9, splay: 5, tipBend: 6 },
    ],
    { blade: 'orbicular', ratio: 0.92, veins: 'midrib' }
  ),
  stages: [
    { at: 0.05, label: 'Черенок', note: 'Размножается листом с кусочком черешка.' },
    { at: 0.35, label: 'Молодое', note: 'Куст остаётся низким: вверх пеперомия почти не растёт.' },
    { at: 0.7, label: 'Взрослое', note: 'Лист плотный и запасает воду, поэтому переливы для неё опаснее сушки.' },
    { at: 1, label: 'Крупное', note: 'Разрастается в стороны, заполняя горшок плотной подушкой.' },
  ],
};

export const pileaPeperomioides: PlantModel = {
  pot: { style: 'straight', width: 34, height: 23 },
  maturation: 0.26,
  organs: clump(
    [
      // The petiole joins the middle of the underside, so each blade sits like a parasol
      { length: 24, petiole: 34, splay: 40, tipBend: 0 },
      { length: 25, petiole: 40, splay: 33, tipBend: 0 },
      { length: 23, petiole: 28, splay: 24, tipBend: 0 },
      { length: 22, petiole: 44, splay: 17, tipBend: 0 },
      { length: 20, petiole: 36, splay: 10, tipBend: 0 },
      { length: 17, petiole: 26, splay: 4, tipBend: 0 },
    ],
    { blade: 'peltate', veins: 'palmate' }
  ),
  stages: [
    { at: 0.05, label: 'Детка', note: 'Даёт детки от корня — их отсаживают, когда подрастут.' },
    { at: 0.35, label: 'Молодое', note: 'Черешки короткие, листья ещё мелкие.' },
    { at: 0.7, label: 'Взрослое', note: 'Черешок крепится к середине листа снизу, а не к краю.' },
    { at: 1, label: 'Крупное', note: 'Тянется к свету и кривится, если горшок не поворачивать.' },
  ],
};

export const begoniaMaculata: PlantModel = {
  pot: { style: 'straight', width: 34, height: 24 },
  maturation: 0.28,
  organs: clump(
    [
      // Lopsided blades: one half of the leaf is visibly broader than the other
      { length: 34, petiole: 22, splay: 38, tipBend: 18 },
      { length: 35, petiole: 27, splay: 32, tipBend: 16 },
      { length: 32, petiole: 18, splay: 23, tipBend: 20 },
      { length: 30, petiole: 30, splay: 15, tipBend: 14 },
      { length: 26, petiole: 24, splay: 8, tipBend: 12 },
    ],
    { blade: 'wing', veins: 'pinnate', variegation: 'spot' }
  ),
  stages: [
    { at: 0.05, label: 'Черенок', note: 'Укореняется стеблевым черенком с одним листом.' },
    { at: 0.35, label: 'Молодое', note: 'Пятна на листе есть с самого начала, но их пока мало.' },
    { at: 0.7, label: 'Взрослое', note: 'Половинки листа неравны — это признак рода, а не повреждение.' },
    { at: 1, label: 'Крупное', note: 'Обратная сторона листа красная: так растение использует слабый свет.' },
  ],
};

/** Maidenhair fern: wiry stalks carrying many small fan-shaped leaflets */
function maidenhairFrond(values: {
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
    // Spacing along the rachis has to exceed the pinnule's width, or the pairs merge into
    // a solid sausage instead of the airy frond a maidenhair actually has
    pairs: 5,
    leaflet: 8,
    leafletRatio: 1.05,
    taper: 0.6,
    bare: 0.26,
    pitch: 78,
    blade: 'orbicular',
    thick: 1.1,
    tone: values.tone,
  };
}

export const adiantum: PlantModel = {
  pot: { style: 'straight', width: 32, height: 22 },
  maturation: 0.28,
  organs: [
    maidenhairFrond({ age: 0, angle: -12, splay: -30, length: 52, bow: -8, tone: 0 }),
    maidenhairFrond({ age: 0.15, angle: 13, splay: 27, length: 54, bow: 8, tone: 1 }),
    maidenhairFrond({ age: 0.33, angle: -11, splay: -21, length: 47, bow: -7, tone: 2 }),
    maidenhairFrond({ age: 0.5, angle: 12, splay: 18, length: 44, bow: 7, tone: 0 }),
    maidenhairFrond({ age: 0.68, angle: -9, splay: -11, length: 38, bow: -5, tone: 1 }),
    maidenhairFrond({ age: 0.86, angle: 8, splay: 8, length: 33, bow: 5, tone: 2 }),
  ],
  stages: [
    { at: 0.05, label: 'Делёнка', note: 'Проще всего размножать делением корневища.' },
    { at: 0.35, label: 'Молодое', note: 'Новый лист разворачивается из закрученной спирали.' },
    { at: 0.7, label: 'Взрослое', note: 'Черешки тонкие и почти чёрные — отсюда «венерин волос».' },
    { at: 1, label: 'Крупное', note: 'Пересушка земляного кома для него самая частая причина гибели листьев.' },
  ],
};

export const lithops: PlantModel = {
  pot: { style: 'straight', width: 62, height: 13 },
  maturation: 0.34,
  organs: [
    // Each head is a single pair of fused leaves with a slit between them
    ...[
      { age: 0, x: -17, size: 20 },
      { age: 0.42, x: 3, size: 18 },
      { age: 0.74, x: 20, size: 15 },
    ].flatMap((head, i): PlantOrgan[] => [
      {
        kind: 'leaf',
        age: head.age,
        at: [head.x, 1],
        angle: 0,
        length: head.size,
        ratio: 1.3,
        blade: 'orbicular',
        tone: (i % 3) as 0 | 1 | 2,
      },
      {
        kind: 'stem',
        age: head.age + 0.06,
        from: [head.x - head.size * 0.32, head.size * 0.78],
        to: [head.x + head.size * 0.32, head.size * 0.78],
        thick: 1.5,
      },
    ]),
  ],
  stages: [
    { at: 0.05, label: 'Сеянец', note: 'Из семян: первая пара листьев появляется через несколько недель.' },
    { at: 0.4, label: 'Одна пара', note: 'Взрослое растение — это одна пара сросшихся листьев, не больше.' },
    { at: 0.7, label: 'Две головы', note: 'Со временем делится, и в горшке становится две головы.' },
    { at: 1, label: 'Группа', note: 'Щель между листьями — единственное место, откуда идёт новый рост.' },
  ],
};
