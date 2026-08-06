import { LeafOrgan, PlantModel } from '../../types/plantModel';

/**
 * Calathea. Each blade sits on its own long petiole straight from the base, so the plant is a
 * bundle of stalks rather than a stem with leaves. The pale bands radiating from the midrib are
 * the whole point of the species — without them it is indistinguishable from any other oval
 * clump. New leaves arrive rolled into a tube in the middle of the clump.
 */

function leaf(values: {
  age: number;
  angle: number;
  splay: number;
  length: number;
  petiole: number;
  tipBend: number;
  tone: 0 | 1 | 2;
}): LeafOrgan {
  return {
    kind: 'leaf',
    age: values.age,
    at: [0, 2],
    angle: values.angle,
    splay: values.splay,
    length: values.length,
    ratio: 0.54,
    petiole: values.petiole,
    bow: values.angle < 0 ? -4 : 4,
    tipBend: values.tipBend,
    blade: 'elliptic',
    veins: 'pinnate',
    variegation: 'stripe',
    tone: values.tone,
  };
}

export const calathea: PlantModel = {
  pot: { style: 'straight', width: 40, height: 26 },
  maturation: 0.26,
  organs: [
    leaf({ age: 0, angle: -13, splay: -30, length: 37, petiole: 34, tipBend: -10, tone: 0 }),
    leaf({ age: 0.15, angle: 12, splay: 28, length: 38, petiole: 38, tipBend: 9, tone: 1 }),
    leaf({ age: 0.33, angle: -14, splay: -20, length: 35, petiole: 28, tipBend: -14, tone: 2 }),
    leaf({ age: 0.5, angle: 13, splay: 17, length: 34, petiole: 46, tipBend: 12, tone: 0 }),
    leaf({ age: 0.68, angle: -9, splay: -10, length: 32, petiole: 40, tipBend: -7, tone: 1 }),
    leaf({ age: 0.86, angle: 7, splay: 7, length: 29, petiole: 50, tipBend: 5, tone: 2 }),
  ],
  stages: [
    { at: 0.05, label: 'Делёнка', note: 'Черенком не размножается — только делением куста с корнями.' },
    { at: 0.35, label: 'Молодое', note: 'Каждый лист — на своём черешке от самого основания.' },
    { at: 0.7, label: 'Взрослое', note: 'Полосы проявляются в полную силу только при рассеянном свете.' },
    { at: 1, label: 'Крупное', note: 'Новый лист выходит из центра трубочкой и разворачивается за несколько дней.' },
  ],
};
