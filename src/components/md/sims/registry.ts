import React from 'react';
import SpongeJar from './SpongeJar';

/**
 * Single registration point for interactive simulations.
 * Use in markdown as: <sim name="sponge-jar" />
 */
export const sims: Record<string, React.ComponentType> = {
  'sponge-jar': SpongeJar,
};
