import React from 'react';
import Callout from './Callout';
import Quiz from './Quiz';
import Spoiler from './Spoiler';
import Sim from './Sim';

/**
 * Props every markdown directive component receives.
 *
 * `label`    — text in square brackets: `:::callout[Осторожно]`
 * `attrs`    — key="value" pairs: `{hint="..."}` or `<sim name="..." />`
 * `children` — rendered markdown body of the directive
 */
export interface MdDirectiveProps {
  label?: string;
  attrs: Record<string, string>;
  children?: React.ReactNode;
}

/**
 * Single registration point for markdown directives.
 * Adding a component here makes its syntax available in every note.
 */
export const mdDirectives: Record<string, React.ComponentType<MdDirectiveProps>> = {
  callout: Callout,
  quiz: Quiz,
  spoiler: Spoiler,
  sim: Sim,
};

export const mdDirectiveNames = Object.keys(mdDirectives);
