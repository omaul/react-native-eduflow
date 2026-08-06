import { PlantModel } from '../../types/plantModel';
import { vine } from './shapes';

/**
 * The climbers. They share a growth habit — one tip, leaves strictly ordered by age — so what
 * separates them in a portrait is the blade: how big, how pointed, and what pattern it carries.
 * Drawn side by side on purpose, because the old generative portraits made all four identical.
 */

/** The line the stem follows: up out of the pot, then arching over to one side */
const ARCH: [number, number][] = [
  [-8, 1],
  [-7, 20],
  [-3, 38],
  [4, 54],
  [13, 66],
  [21, 76],
  [26, 84],
];

export const epipremnum: PlantModel = {
  pot: { style: 'hanging', width: 34, height: 19 },
  maturation: 0.22,
  organs: vine(
    ARCH,
    [
      { length: 30, angle: 66, petiole: 9 },
      { length: 29, angle: 70, petiole: 8 },
      { length: 27, angle: 72, petiole: 8 },
      { length: 25, angle: 74, petiole: 7 },
      { length: 22, angle: 78, petiole: 6 },
      { length: 19, angle: 82, petiole: 5 },
    ],
    { blade: 'cordate', veins: 'pinnate' }
  ),
  stages: [
    { at: 0.05, label: 'Черенок', note: 'Черенок с одним узлом даёт корни в воде за пару недель.' },
    { at: 0.35, label: 'Молодое', note: 'Пока лоза короткая, листья мелкие — крупные она отращивает с возрастом.' },
    { at: 0.7, label: 'Взрослое', note: 'Побег тянется в сторону: в природе он ищет ствол, по которому лезть.' },
    { at: 1, label: 'Крупное', note: 'Самые большие листья — у основания, они росли дольше всех.' },
  ],
};

export const philodendronScandens: PlantModel = {
  pot: { style: 'hanging', width: 34, height: 19 },
  maturation: 0.22,
  organs: vine(
    ARCH,
    [
      // Narrower and more sharply pointed than the epipremnum's, and plain green
      { length: 27, angle: 68, petiole: 10, tipBend: 14 },
      { length: 26, angle: 72, petiole: 9, tipBend: 14 },
      { length: 24, angle: 74, petiole: 8, tipBend: 12 },
      { length: 22, angle: 76, petiole: 8, tipBend: 12 },
      { length: 20, angle: 80, petiole: 7, tipBend: 10 },
      { length: 17, angle: 84, petiole: 6, tipBend: 10 },
    ],
    { blade: 'cordate', ratio: 0.62, veins: 'pinnate' }
  ),
  stages: [
    { at: 0.05, label: 'Черенок', note: 'Укореняется так же легко, как эпипремнум, — узлом в воду.' },
    { at: 0.35, label: 'Молодое', note: 'Лист уже, чем у эпипремнума, и с более вытянутым кончиком.' },
    { at: 0.7, label: 'Взрослое', note: 'Из узлов идут воздушные корни — ими лоза цепляется за опору.' },
    { at: 1, label: 'Крупное', note: 'На опоре листья вырастают заметно крупнее, чем на свисающей лозе.' },
  ],
};

export const philodendronMelanochrysum: PlantModel = {
  pot: { style: 'straight', width: 36, height: 22 },
  maturation: 0.26,
  organs: vine(
    // Climbs rather than trails: the stem stays close to vertical
    [
      [-4, 1],
      [-3, 22],
      [-1, 42],
      [2, 60],
      [5, 74],
      [8, 86],
    ],
    [
      // Long, narrow, velvety blades hanging down from a vertical stem
      { length: 40, angle: 54, petiole: 8, tipBend: 26 },
      { length: 37, angle: 58, petiole: 8, tipBend: 24 },
      { length: 33, angle: 62, petiole: 7, tipBend: 22 },
      { length: 29, angle: 66, petiole: 6, tipBend: 20 },
      { length: 24, angle: 70, petiole: 6, tipBend: 18 },
    ],
    { blade: 'cordate', ratio: 0.5, veins: 'pinnate', variegation: 'light-veins' },
    { thick: 3 }
  ),
  stages: [
    { at: 0.05, label: 'Черенок', note: 'Размножается узлом с воздушным корнем.' },
    { at: 0.35, label: 'Молодое', note: 'Молодые листья мелкие и почти без бархата — он приходит позже.' },
    { at: 0.7, label: 'Взрослое', note: 'Растёт вертикально по опоре, листья свисают вниз.' },
    { at: 1, label: 'Крупное', note: 'Светлые жилки на тёмном бархате — главный признак вида.' },
  ],
};

export const hoyaCarnosa: PlantModel = {
  pot: { style: 'hanging', width: 32, height: 18 },
  maturation: 0.24,
  organs: vine(
    ARCH,
    [
      // Thick, stiff, almost succulent ovals in opposite pairs
      { length: 22, angle: 74, petiole: 5, tipBend: 6 },
      { length: 22, angle: 78, petiole: 5, tipBend: 6 },
      { length: 21, angle: 76, petiole: 4, tipBend: 5 },
      { length: 20, angle: 80, petiole: 4, tipBend: 5 },
      { length: 19, angle: 78, petiole: 4, tipBend: 4 },
      { length: 17, angle: 82, petiole: 3, tipBend: 4 },
    ],
    { blade: 'elliptic', ratio: 0.6, veins: 'midrib' },
    { thick: 2 }
  ),
  stages: [
    { at: 0.05, label: 'Черенок', note: 'Черенок с двумя листьями укореняется медленно, но надёжно.' },
    { at: 0.35, label: 'Молодое', note: 'Сначала лоза гонит длинный безлистный побег — это нормально.' },
    { at: 0.7, label: 'Взрослое', note: 'Листья плотные и запасают воду, поэтому пересушку хойя переносит.' },
    { at: 1, label: 'Крупное', note: 'Цветочные подушки-шпорцы обрезать нельзя: цветёт она из них повторно.' },
  ],
};
