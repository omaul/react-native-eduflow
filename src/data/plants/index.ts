/**
 * Registry of authored plant models, keyed by the plant id in
 * public/content/species/catalog.json.
 *
 * A plant with no entry here keeps the generative portrait built from its three `visual`
 * traits, so the library never has a gap while species are being drawn one at a time.
 */

import { PlantModel } from '../../types/plantModel';
import {
  alocasia,
  anthurium,
  anthuriumCrystallinum,
  monsteraDeliciosa,
  spathiphyllum,
} from './arums';
import { calathea } from './calathea';
import {
  adiantum,
  begoniaMaculata,
  crassula,
  ficusElastica,
  lithops,
  peperomia,
  pileaPeperomioides,
} from './others';
import {
  aloeVera,
  chlorophytum,
  dracaena,
  sansevieria,
  tillandsia,
} from './rosettes';
import { scindapsusPictus } from './scindapsusPictus';
import {
  epipremnum,
  hoyaCarnosa,
  philodendronMelanochrysum,
  philodendronScandens,
} from './vines';
import { zamioculcas } from './zamioculcas';

export const PLANT_MODELS: Record<string, PlantModel> = {
  adiantum,
  alocasia,
  'aloe-vera': aloeVera,
  anthurium,
  'anthurium-crystallinum': anthuriumCrystallinum,
  'begonia-maculata': begoniaMaculata,
  calathea,
  chlorophytum,
  crassula,
  dracaena,
  'ficus-elastica': ficusElastica,
  epipremnum,
  'hoya-carnosa': hoyaCarnosa,
  'philodendron-melanochrysum': philodendronMelanochrysum,
  'philodendron-scandens': philodendronScandens,
  lithops,
  'monstera-deliciosa': monsteraDeliciosa,
  peperomia,
  'pilea-peperomioides': pileaPeperomioides,
  sansevieria,
  'scindapsus-pictus': scindapsusPictus,
  spathiphyllum,
  tillandsia,
  zamioculcas,
};

export function findPlantModel(id: string): PlantModel | null {
  return PLANT_MODELS[id] ?? null;
}
