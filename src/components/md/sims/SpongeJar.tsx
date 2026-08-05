import React from 'react';
import p5 from 'p5';
import {
  createSpongeJarSketch,
  SpongeJarApi,
  SpongeJarPreset,
  SpongeJarStats,
} from '../../../sketches/spongeJar';
import { DropIcon, ResetIcon } from '../../Icons';
import s from './SpongeJar.module.css';

const PRESETS: { key: SpongeJarPreset; title: string; hint: string }[] = [
  { key: 'loose', title: 'Рыхлый субстрат', hint: 'губки + шарики, есть воздушные карманы' },
  { key: 'dense', title: 'Плотный грунт', hint: 'торф почти без связанных пор' },
  { key: 'stones', title: 'Только камни', hint: 'один дренаж, удерживать влагу нечем' },
];

const EMPTY_STATS: SpongeJarStats = {
  aeration: 0,
  retained: 0,
  standing: 0,
  drained: 0,
  poured: 0,
};

function verdict(stats: SpongeJarStats): string {
  if (stats.poured === 0) return 'Полей и посмотри, что произойдёт.';

  // Shares, not absolute counts — the reader can water more than once
  if (stats.standing / stats.poured > 0.5) {
    return 'Это болото: вода стоит, воздушные карманы залиты. Корням дышать нечем — отсюда гниль. И обрати внимание: воды было ровно столько же, сколько в рыхлой смеси.';
  }
  if (stats.retained === 0) {
    return 'Вода прошла насквозь, удерживать её нечем. Дренаж идеальный, влагоёмкости нет — поливать придётся каждый день.';
  }
  return 'Лишняя вода ушла в дренаж, губки остались влажными, воздушные карманы на месте. Полей ещё раз — увидишь, что происходит, когда губки насыщаются.';
}

export default function SpongeJar() {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const apiRef = React.useRef<SpongeJarApi | null>(null);
  const [preset, setPreset] = React.useState<SpongeJarPreset>('loose');
  const [stats, setStats] = React.useState<SpongeJarStats>(EMPTY_STATS);

  React.useEffect(() => {
    if (!containerRef.current) return;
    const { sketch, api } = createSpongeJarSketch(containerRef.current, setStats);
    apiRef.current = api;
    const instance = new p5(sketch, containerRef.current);

    return () => {
      instance.remove();
      apiRef.current = null;
    };
  }, []);

  function choosePreset(next: SpongeJarPreset) {
    setPreset(next);
    setStats(EMPTY_STATS);
    apiRef.current?.reset(next);
  }

  const activePreset = PRESETS.find((item) => item.key === preset);

  return (
    <div className={s.sim}>
      <div className={s.presets} role="group" aria-label="Состав субстрата">
        {PRESETS.map((item) => (
          <button
            key={item.key}
            type="button"
            className={s.preset}
            aria-pressed={preset === item.key}
            title={item.hint}
            onClick={() => choosePreset(item.key)}
          >
            {item.title}
          </button>
        ))}
      </div>

      <div
        ref={containerRef}
        className={s.canvas}
        role="img"
        aria-label={`Симуляция полива: ${activePreset?.title}. ${verdict(stats)}`}
      />

      <div className={s.actions}>
        <button type="button" className={s.primary} onClick={() => apiRef.current?.pour()}>
          <DropIcon className={s.actionIcon} />
          Полить
        </button>
        <button type="button" className={s.ghost} onClick={() => choosePreset(preset)}>
          <ResetIcon className={s.actionIcon} />
          Сброс
        </button>
      </div>

      <dl className={s.stats}>
        <div className={s.stat}>
          <dt>Воздушных карманов</dt>
          <dd>{stats.aeration}%</dd>
        </div>
        <div className={s.stat}>
          <dt>Удержано влаги</dt>
          <dd>{stats.retained}</dd>
        </div>
        <div className={s.stat}>
          <dt>Стоит в горшке</dt>
          <dd>{stats.standing}</dd>
        </div>
        <div className={s.stat}>
          <dt>Ушло в дренаж</dt>
          <dd>{stats.drained}</dd>
        </div>
      </dl>

      <p className={s.verdict}>{verdict(stats)}</p>
    </div>
  );
}
