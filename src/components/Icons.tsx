import React from 'react';

const iconDefaults = {
  viewBox: '0 0 24 24',
  width: 20,
  height: 20,
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true as const,
};

export function FolderIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...iconDefaults} {...props}>
      <path d="M3 8v11a1 1 0 001 1h16a1 1 0 001-1V10a1 1 0 00-1-1h-8.5l-2-2H4a1 1 0 00-1 1z" />
      {/* Page corner peeking out — hint of content */}
      <path d="M15 13.5l2.5 0 0 2.5" fill="none" />
      <circle cx="7" cy="15.5" r="0.4" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function ListIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...iconDefaults} {...props}>
      {/* Bullets — varying sizes, like particles */}
      <circle cx="4.5" cy="7" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="4.5" cy="12" r="0.8" fill="currentColor" stroke="none" />
      <circle cx="4.5" cy="17" r="0.95" fill="currentColor" stroke="none" />
      {/* Lines */}
      <line x1="8.5" y1="7" x2="20" y2="7" />
      <line x1="8.5" y1="12" x2="16.5" y2="12" />
      <line x1="8.5" y1="17" x2="13" y2="17" />
      {/* Small tick — like a completed item */}
      <path d="M18.5 11l1 1.5 2-2.5" fill="none" />
    </svg>
  );
}

export function SunIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...iconDefaults} {...props}>
      <circle cx="12" cy="12" r="3.5" />
      {/* Rays — each breathes independently along its direction */}
      <line x1="12" y1="2" x2="12" y2="6">
        <animate attributeName="y1" values="2;0.5;2" dur="4s" begin="0s" repeatCount="indefinite" />
      </line>
      <line x1="12" y1="18" x2="12" y2="22">
        <animate attributeName="y2" values="22;23.5;22" dur="4s" begin="1.2s" repeatCount="indefinite" />
      </line>
      <line x1="2" y1="12" x2="6" y2="12">
        <animate attributeName="x1" values="2;0.5;2" dur="4s" begin="0.6s" repeatCount="indefinite" />
      </line>
      <line x1="18" y1="12" x2="22" y2="12">
        <animate attributeName="x2" values="22;23.5;22" dur="4s" begin="1.8s" repeatCount="indefinite" />
      </line>
      <line x1="5.5" y1="5.5" x2="7.5" y2="7.5">
        <animate attributeName="x1" values="5.5;4.5;5.5" dur="4s" begin="0.3s" repeatCount="indefinite" />
        <animate attributeName="y1" values="5.5;4.5;5.5" dur="4s" begin="0.3s" repeatCount="indefinite" />
      </line>
      <line x1="16.5" y1="16.5" x2="18.5" y2="18.5">
        <animate attributeName="x2" values="18.5;19.5;18.5" dur="4s" begin="1.5s" repeatCount="indefinite" />
        <animate attributeName="y2" values="18.5;19.5;18.5" dur="4s" begin="1.5s" repeatCount="indefinite" />
      </line>
      <line x1="5.5" y1="18.5" x2="7.5" y2="16.5">
        <animate attributeName="x1" values="5.5;4.5;5.5" dur="4s" begin="0.9s" repeatCount="indefinite" />
        <animate attributeName="y1" values="18.5;19.5;18.5" dur="4s" begin="0.9s" repeatCount="indefinite" />
      </line>
      <line x1="16.5" y1="7.5" x2="18.5" y2="5.5">
        <animate attributeName="x2" values="18.5;19.5;18.5" dur="4s" begin="2.1s" repeatCount="indefinite" />
        <animate attributeName="y2" values="5.5;4.5;5.5" dur="4s" begin="2.1s" repeatCount="indefinite" />
      </line>
      {/* Inner ring — like a warm glow */}
      <circle cx="12" cy="12" r="5.5" opacity="0.2" />
    </svg>
  );
}

export function MoonIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...iconDefaults} {...props}>
      <path d="M20.4 13.3A8 8 0 1110.7 3.6a6 6 0 009.7 9.7z" />
      {/* Star — small cross, with gentle twinkle */}
      <g opacity="1">
        <line x1="19.5" y1="4" x2="19.5" y2="6.5" />
        <line x1="18.2" y1="5.2" x2="20.8" y2="5.2" />
        <animate attributeName="opacity" values="1;0.3;1" dur="3s" repeatCount="indefinite" />
      </g>
      {/* Distant star — dot */}
      <circle cx="16" cy="3" r="0.4" fill="currentColor" stroke="none" />
    </svg>
  );
}
