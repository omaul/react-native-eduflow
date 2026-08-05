import React from 'react';
import { InfoIcon, WarningIcon, BanIcon, CheckIcon } from '../Icons';
import { MdDirectiveProps } from './registry';
import s from './Callout.module.css';

type Variant = 'info' | 'warning' | 'danger' | 'success';

const VARIANTS: Variant[] = ['info', 'warning', 'danger', 'success'];

// The label carries the meaning, so it also picks the colour.
const LABEL_VARIANTS: Record<string, Variant> = {
  важно: 'warning',
  внимание: 'warning',
  осторожно: 'warning',
  'не делай': 'danger',
  'не используй': 'danger',
  никогда: 'danger',
  опасно: 'danger',
  ошибка: 'danger',
  интересно: 'info',
  'на заметку': 'info',
  запомни: 'info',
  подсказка: 'info',
  совет: 'info',
  готово: 'success',
  хорошо: 'success',
  работает: 'success',
};

const ICONS: Record<Variant, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  info: InfoIcon,
  warning: WarningIcon,
  danger: BanIcon,
  success: CheckIcon,
};

function resolveVariant(label?: string, explicit?: string): Variant {
  if (explicit && (VARIANTS as string[]).includes(explicit)) return explicit as Variant;
  if (label && LABEL_VARIANTS[label.trim().toLowerCase()]) {
    return LABEL_VARIANTS[label.trim().toLowerCase()];
  }
  return 'info';
}

export default function Callout({ label, attrs, children }: MdDirectiveProps) {
  const variant = resolveVariant(label, attrs.variant);
  const Icon = ICONS[variant];

  return (
    <aside className={`${s.callout} ${s[variant]}`}>
      {label && (
        <p className={s.label}>
          <Icon className={s.icon} />
          <span>{label}</span>
        </p>
      )}
      <div className={s.body}>{children}</div>
    </aside>
  );
}
