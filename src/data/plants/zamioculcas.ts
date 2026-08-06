import { FrondOrgan, PlantModel } from '../../types/plantModel';

/**
 * Zamioculcas zamiifolia. What reads as a "stem" is one compound leaf: a thick fleshy
 * rachis, bare for its lower third, then paired glossy leaflets. New leaves come up from the
 * rhizome already close to full height, and the older ones lean further out over time — which
 * is why the plant slowly turns from a bunch of spears into a wide vase.
 */

/** The fronds differ only in size and lean, so they are built from one shape */
function frond(values: {
  age: number;
  x: number;
  angle: number;
  splay: number;
  length: number;
  pairs: number;
  leaflet: number;
  bow: number;
  thick: number;
  tone: 0 | 1 | 2;
}): FrondOrgan {
  return {
    kind: 'frond',
    age: values.age,
    at: [values.x, 1],
    angle: values.angle,
    splay: values.splay,
    length: values.length,
    bow: values.bow,
    pairs: values.pairs,
    leaflet: values.leaflet,
    leafletRatio: 0.5,
    taper: 0.58,
    bare: 0.26,
    pitch: 58,
    blade: 'elliptic',
    veins: 'midrib',
    thick: values.thick,
    tone: values.tone,
  };
}

export const zamioculcas: PlantModel = {
  pot: { style: 'tapered', width: 42, height: 24 },
  maturation: 0.3,
  organs: [
    frond({ age: 0, x: -1, angle: -10, splay: -19, length: 78, pairs: 8, leaflet: 21, bow: -5, thick: 3.2, tone: 0 }),
    frond({ age: 0.15, x: 1, angle: 11, splay: 17, length: 80, pairs: 8, leaflet: 21, bow: 5, thick: 3.2, tone: 1 }),
    frond({ age: 0.34, x: -2, angle: -11, splay: -14, length: 70, pairs: 7, leaflet: 19, bow: -5, thick: 2.8, tone: 2 }),
    frond({ age: 0.53, x: 2, angle: 12, splay: 12, length: 66, pairs: 7, leaflet: 18, bow: 5, thick: 2.8, tone: 0 }),
    frond({ age: 0.72, x: -3, angle: -8, splay: -7, length: 56, pairs: 6, leaflet: 16, bow: -4, thick: 2.4, tone: 1 }),
    frond({ age: 0.88, x: 3, angle: 7, splay: 6, length: 50, pairs: 6, leaflet: 15, bow: 4, thick: 2.4, tone: 2 }),
  ],
  stages: [
    { at: 0.05, label: 'Лист-черенок', note: 'Размножается одним листочком: он месяцами сидит и растит клубенёк.' },
    { at: 0.35, label: 'Молодое', note: 'Две первые ветви. То, что кажется стеблем, — целый сложный лист.' },
    { at: 0.7, label: 'Взрослое', note: 'Клубень копит воду, поэтому растение переносит забытый полив.' },
    { at: 1, label: 'Крупное', note: 'Старые ветви разошлись наружу, новые идут из центра вертикально.' },
  ],
};
