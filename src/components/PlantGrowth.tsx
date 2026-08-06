import React from 'react';
import { Plant } from '../types/catalog';
import { PlantModel } from '../types/plantModel';
import PlantPortrait from './PlantPortrait';
import s from './PlantGrowth.module.css';

interface PlantGrowthProps {
  plant: Plant;
  model: PlantModel;
}

/** The stage the slider currently sits in — the last one it has reached */
function stageAt(model: PlantModel, age: number): number {
  let index = 0;
  model.stages.forEach((stage, i) => {
    if (age >= stage.at) index = i;
  });
  return index;
}

/**
 * The portrait with a growth slider. Dragging it replays how the species builds itself:
 * which organ comes first, where new ones appear, what the old ones do as the plant fills out.
 * That order is the teaching material — a static portrait cannot show it.
 */
export default function PlantGrowth({ plant, model }: PlantGrowthProps) {
  const [age, setAge] = React.useState(1);
  const current = stageAt(model, age);
  const stage = model.stages[current];

  return (
    <div className={s.growth}>
      <div className={s.frame}>
        <PlantPortrait
          visual={plant.visual!}
          plantId={plant.id}
          age={age}
          detail
          label={`${plant.name}, стадия роста: ${stage.label}`}
        />
      </div>

      <div className={s.controls}>
        <input
          className={s.slider}
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={age}
          onChange={(event) => setAge(Number(event.target.value))}
          aria-label={`Возраст растения: ${plant.name}`}
          aria-valuetext={stage.label}
        />

        <div className={s.stages}>
          {model.stages.map((item, index) => (
            <button
              key={item.label}
              type="button"
              className={`${s.stage} ${index === current ? s.stageActive : ''}`}
              onClick={() => setAge(item.at)}
              aria-pressed={index === current}
            >
              {item.label}
            </button>
          ))}
        </div>

        <p className={s.note}>{stage.note}</p>
      </div>
    </div>
  );
}
