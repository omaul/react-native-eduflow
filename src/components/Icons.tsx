import React from 'react';

/**
 * Geometric folder — angular tab with construction lines
 * and asymmetric detail, matching generative art style.
 */
export function FolderIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {/* Main folder body */}
      <path d="M4 7V19h16V9h-8l-2-2H4z" strokeWidth="1.5" />
      {/* Tab accent — extra geometric line */}
      <line x1="4" y1="9" x2="20" y2="9" strokeWidth="0.75" />
      {/* Construction detail lines */}
      <line x1="7" y1="13" x2="13" y2="13" strokeWidth="1" />
      <line x1="7" y1="15.5" x2="10" y2="15.5" strokeWidth="0.75" />
      {/* Dot accents */}
      <circle cx="17" cy="14" r="0.4" fill="currentColor" stroke="none" />
      <circle cx="15" cy="16" r="0.3" fill="currentColor" stroke="none" />
    </svg>
  );
}

/**
 * Geometric list — lines of varying weight and length,
 * with dot markers creating asymmetric rhythm.
 */
export function ListIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      aria-hidden="true"
      {...props}
    >
      {/* Row 1 — long, bold */}
      <circle cx="4" cy="6" r="1" strokeWidth="0.75" />
      <line x1="8" y1="6" x2="20" y2="6" strokeWidth="2" />
      {/* Row 2 — medium, thin */}
      <circle cx="4" cy="11" r="0.6" strokeWidth="0.75" />
      <line x1="8" y1="11" x2="17" y2="11" strokeWidth="1" />
      {/* Row 3 — short, medium weight */}
      <circle cx="4" cy="16" r="0.8" strokeWidth="0.75" />
      <line x1="8" y1="16" x2="14" y2="16" strokeWidth="1.5" />
      {/* Accent fragment */}
      <line x1="16" y1="16" x2="18" y2="16" strokeWidth="0.75" />
      {/* Dot accents */}
      <circle cx="20" cy="11" r="0.3" fill="currentColor" stroke="none" />
    </svg>
  );
}

/**
 * Geometric burst sun — asymmetric rays of varying length and weight,
 * inspired by algorithmic/generative art aesthetics.
 */
export function SunIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      aria-hidden="true"
      {...props}
    >
      {/* Core */}
      <circle cx="12" cy="12" r="4" strokeWidth="1.5" />
      {/* Rays — alternating long/short, thick/thin for generative feel */}
      {/* N */} <line x1="12" y1="6.5" x2="12" y2="1" strokeWidth="2" />
      {/* NE */} <line x1="15.9" y1="8.1" x2="18.5" y2="5.5" strokeWidth="1" />
      {/* E */} <line x1="17.5" y1="12" x2="23" y2="12" strokeWidth="1.5" />
      {/* SE */} <line x1="15.9" y1="15.9" x2="17.8" y2="17.8" strokeWidth="2" />
      {/* S */} <line x1="12" y1="17.5" x2="12" y2="22" strokeWidth="1" />
      {/* SW */} <line x1="8.1" y1="15.9" x2="5.5" y2="18.5" strokeWidth="1.5" />
      {/* W */} <line x1="6.5" y1="12" x2="2" y2="12" strokeWidth="2" />
      {/* NW */} <line x1="8.1" y1="8.1" x2="6.2" y2="6.2" strokeWidth="1" />
      {/* Extra short accent rays for density */}
      <line x1="14" y1="6.8" x2="15.5" y2="4" strokeWidth="0.75" />
      <line x1="17.2" y1="14" x2="20" y2="15.5" strokeWidth="0.75" />
      <line x1="6.8" y1="10" x2="4" y2="8.5" strokeWidth="0.75" />
    </svg>
  );
}

/**
 * Geometric crescent moon with algorithmic crater circles.
 */
export function MoonIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      aria-hidden="true"
      {...props}
    >
      {/* Crescent — outer arc and inner cutout */}
      <path d="M20 13.07A8.5 8.5 0 1110.93 4 6.5 6.5 0 0020 13.07z" strokeWidth="1.5" />
      {/* Geometric craters — small circles at varying sizes */}
      <circle cx="10" cy="10" r="1.5" strokeWidth="0.75" />
      <circle cx="7.5" cy="14.5" r="0.8" strokeWidth="0.75" />
      <circle cx="12.5" cy="15" r="1" strokeWidth="0.75" />
      {/* Dot accents — like scattered particles */}
      <circle cx="9" cy="17" r="0.3" fill="currentColor" stroke="none" />
      <circle cx="14" cy="12" r="0.3" fill="currentColor" stroke="none" />
      <circle cx="7" cy="11" r="0.3" fill="currentColor" stroke="none" />
    </svg>
  );
}
