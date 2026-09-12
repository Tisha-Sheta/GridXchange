import React from 'react';

export const HeroCircuitBackground: React.FC = () => {
  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0"
      aria-hidden="true"
    >
      <svg
        className="w-full h-full object-cover min-w-[900px] text-blue-500/20 dark:text-teal-400/20"
        viewBox="0 0 1440 700"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          {/* Subtle line glow gradient */}
          <linearGradient id="circuitGradLight" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0D52D6" stopOpacity="0.08" />
            <stop offset="50%" stopColor="#0284C7" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#0D9488" stopOpacity="0.12" />
          </linearGradient>

          <linearGradient id="circuitGradDark" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.10" />
            <stop offset="35%" stopColor="#2DD4BF" stopOpacity="0.25" />
            <stop offset="70%" stopColor="#60A5FA" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#34D399" stopOpacity="0.08" />
          </linearGradient>

          {/* Glowing pulse particle gradient */}
          <linearGradient id="pulseGlow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0" />
            <stop offset="50%" stopColor="currentColor" stopOpacity="1" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>

          {/* Radial mask for soft center fade so it never interferes with text readability */}
          <radialGradient id="heroCenterMask" cx="50%" cy="40%" r="55%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.35" />
            <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="1" />
          </radialGradient>

          <mask id="circuitFadeMask">
            <rect width="1440" height="700" fill="url(#heroCenterMask)" />
          </mask>
        </defs>

        <g mask="url(#circuitFadeMask)" className="animate-circuit-pulse">
          {/* =========================================================
              STATIC BASE CIRCUIT TRACES (10-20% Opacity)
              ========================================================= */}
          
          {/* Circuit Trace 1: Top Left -> Mid-Center */}
          <path
            d="M-40,80 L160,80 L230,150 L410,150 L470,210 L580,210"
            className="stroke-blue-600/15 dark:stroke-teal-400/20"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Circuit Trace 2: Top Right -> Mid-Center */}
          <path
            d="M1480,90 L1240,90 L1170,160 L990,160 L930,220 L820,220"
            className="stroke-blue-600/15 dark:stroke-teal-400/20"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Circuit Trace 3: Upper Left Loop */}
          <path
            d="M120,-20 L120,40 L190,110 L340,110 L390,60 L520,60"
            className="stroke-blue-600/12 dark:stroke-cyan-400/15"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Circuit Trace 4: Upper Right Loop */}
          <path
            d="M1320,-20 L1320,50 L1250,120 L1080,120 L1030,70 L910,70"
            className="stroke-blue-600/12 dark:stroke-cyan-400/15"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Circuit Trace 5: Mid-Left to Lower-Center */}
          <path
            d="M-20,380 L180,380 L260,300 L440,300 L510,370 L650,370 L710,430 L840,430"
            className="stroke-blue-600/18 dark:stroke-teal-300/22"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Circuit Trace 6: Mid-Right to Lower-Center */}
          <path
            d="M1460,360 L1260,360 L1180,280 L1000,280 L930,350 L790,350"
            className="stroke-blue-600/18 dark:stroke-teal-300/22"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Circuit Trace 7: Bottom Left Cross-Bus */}
          <path
            d="M-30,530 L210,530 L290,450 L460,450 L530,520 L680,520"
            className="stroke-blue-600/14 dark:stroke-teal-400/18"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Circuit Trace 8: Bottom Right Cross-Bus */}
          <path
            d="M1470,510 L1250,510 L1170,430 L1020,430 L950,500 L810,500"
            className="stroke-blue-600/14 dark:stroke-teal-400/18"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Circuit Trace 9: Bottom Edge Perimeter Path */}
          <path
            d="M320,620 L480,620 L550,550 L890,550 L960,620 L1120,620"
            className="stroke-blue-600/10 dark:stroke-cyan-400/12"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* =========================================================
              ANIMATED SHIMMER / TRAVELING GLOW PULSE OVERLAYS
              ========================================================= */}
          
          <path
            d="M-40,80 L160,80 L230,150 L410,150 L470,210 L580,210"
            className="stroke-teal-500 dark:stroke-teal-300 animate-circuit-flow opacity-60"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <path
            d="M1480,90 L1240,90 L1170,160 L990,160 L930,220 L820,220"
            className="stroke-sky-500 dark:stroke-cyan-300 animate-circuit-flow-reverse opacity-60"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <path
            d="M-20,380 L180,380 L260,300 L440,300 L510,370 L650,370 L710,430 L840,430"
            className="stroke-emerald-500 dark:stroke-teal-300 animate-circuit-flow opacity-50"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <path
            d="M1460,360 L1260,360 L1180,280 L1000,280 L930,350 L790,350"
            className="stroke-teal-500 dark:stroke-cyan-300 animate-circuit-flow-reverse opacity-50"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* =========================================================
              CIRCUIT JUNCTION PADS & SOLDER NODES
              ========================================================= */}
          
          {/* Top Left nodes */}
          <circle cx="160" cy="80" r="3" className="fill-blue-500/40 dark:fill-teal-300/60" />
          <circle cx="230" cy="150" r="4.5" className="stroke-blue-500/40 dark:stroke-teal-300/60 fill-none" strokeWidth="1.5" />
          <circle cx="410" cy="150" r="2.5" className="fill-blue-500/40 dark:fill-teal-300/60" />
          <circle cx="470" cy="210" r="2.5" className="fill-blue-500/40 dark:fill-teal-300/60" />
          <circle cx="580" cy="210" r="4" className="fill-blue-500/50 dark:fill-teal-300/80" />

          {/* Top Right nodes */}
          <circle cx="1240" cy="90" r="3" className="fill-blue-500/40 dark:fill-cyan-300/60" />
          <circle cx="1170" cy="160" r="4.5" className="stroke-blue-500/40 dark:stroke-cyan-300/60 fill-none" strokeWidth="1.5" />
          <circle cx="990" cy="160" r="2.5" className="fill-blue-500/40 dark:fill-cyan-300/60" />
          <circle cx="930" cy="220" r="2.5" className="fill-blue-500/40 dark:fill-cyan-300/60" />
          <circle cx="820" cy="220" r="4" className="fill-blue-500/50 dark:fill-cyan-300/80" />

          {/* Upper loops nodes */}
          <circle cx="190" cy="110" r="2.5" className="fill-blue-400/30 dark:fill-teal-400/40" />
          <circle cx="340" cy="110" r="3.5" className="stroke-blue-400/40 dark:stroke-teal-400/50 fill-none" strokeWidth="1.2" />
          <circle cx="520" cy="60" r="3" className="fill-blue-400/40 dark:fill-teal-400/60" />

          <circle cx="1250" cy="120" r="2.5" className="fill-blue-400/30 dark:fill-cyan-400/40" />
          <circle cx="1080" cy="120" r="3.5" className="stroke-blue-400/40 dark:stroke-cyan-400/50 fill-none" strokeWidth="1.2" />
          <circle cx="910" cy="70" r="3" className="fill-blue-400/40 dark:fill-cyan-400/60" />

          {/* Mid-Lower nodes */}
          <circle cx="260" cy="300" r="4.5" className="stroke-blue-500/40 dark:stroke-teal-300/60 fill-none" strokeWidth="1.5" />
          <circle cx="440" cy="300" r="3" className="fill-blue-500/40 dark:fill-teal-300/60" />
          <circle cx="650" cy="370" r="2.5" className="fill-blue-500/40 dark:fill-teal-300/60" />
          <circle cx="840" cy="430" r="4" className="fill-blue-500/50 dark:fill-teal-300/80" />

          <circle cx="1180" cy="280" r="4.5" className="stroke-blue-500/40 dark:stroke-cyan-300/60 fill-none" strokeWidth="1.5" />
          <circle cx="1000" cy="280" r="3" className="fill-blue-500/40 dark:fill-cyan-300/60" />
          <circle cx="790" cy="350" r="4" className="fill-blue-500/50 dark:fill-cyan-300/80" />

          {/* Bottom Bus nodes */}
          <circle cx="290" cy="450" r="3" className="fill-blue-400/30 dark:fill-teal-400/50" />
          <circle cx="680" cy="520" r="3.5" className="stroke-blue-400/40 dark:stroke-teal-400/60 fill-none" strokeWidth="1.5" />
          
          <circle cx="1170" cy="430" r="3" className="fill-blue-400/30 dark:fill-cyan-400/50" />
          <circle cx="810" cy="500" r="3.5" className="stroke-blue-400/40 dark:stroke-cyan-400/60 fill-none" strokeWidth="1.5" />
        </g>
      </svg>
    </div>
  );
};
