import React from 'react';
import { ShieldCheck, Cpu, Radio, Award, Layers, Zap } from 'lucide-react';

const PARTNERS_AND_STANDARDS = [
  { name: 'Gujarat DISCOM Feeder Network', icon: Zap, label: 'Feeder Sync' },
  { name: 'OpenADR 2.0b Protocol', icon: Radio, label: 'Automated DR' },
  { name: 'IEEE 2030.5 Standard', icon: Cpu, label: 'DER Interop' },
  { name: 'CERC P2P Framework', icon: ShieldCheck, label: 'Regulatory' },
  { name: 'DLMS / COSEM Smart Meters', icon: Layers, label: 'Telemetry' },
  { name: 'IEC 61850 Grid Automation', icon: Award, label: 'Substation' },
  { name: 'ISO 50001 Energy Management', icon: ShieldCheck, label: 'Efficiency' },
  { name: 'Green Open Access 2022', icon: Zap, label: 'Zero Wheeling' },
];

export const PartnerMarquee: React.FC = () => {
  return (
    <div className="w-full overflow-hidden py-6 border-y border-[#E6E2D8] dark:border-[#262723] bg-[#FAF8F5]/60 dark:bg-[#121311]/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-3 flex items-center justify-between">
        <span className="text-[11px] font-mono uppercase tracking-widest text-[#8D9188] font-semibold">
          Microgrid Interoperability & Protocols
        </span>
        <span className="text-[11px] font-mono text-[#2D6A4F] dark:text-[#52B788] flex items-center gap-1.5 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-[#2D6A4F] dark:bg-[#52B788] animate-pulse" />
          Live Grid Interconnect
        </span>
      </div>

      <div className="relative w-full overflow-hidden flex [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
        {/* Double row for seamless infinite looping */}
        <div className="animate-marquee flex items-center gap-6 shrink-0 py-1">
          {PARTNERS_AND_STANDARDS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={`p1-${idx}`}
                className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#FFFFFF] dark:bg-[#1A1B18] border border-[#E6E2D8] dark:border-[#2A2B27] shadow-2xs hover:border-[#B45309] dark:hover:border-[#E5A93C] transition-colors shrink-0"
              >
                <div className="p-1 rounded-md bg-[#FAF8F5] dark:bg-[#252723] text-[#B45309] dark:text-[#E5A93C]">
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-heading font-bold text-[#1A1B19] dark:text-[#EDEDE8] whitespace-nowrap">
                  {item.name}
                </span>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#8D9188] bg-[#F3EFE8] dark:bg-[#20211E] px-2 py-0.5 rounded-full">
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>

        <div className="animate-marquee flex items-center gap-6 shrink-0 py-1" aria-hidden="true">
          {PARTNERS_AND_STANDARDS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={`p2-${idx}`}
                className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#FFFFFF] dark:bg-[#1A1B18] border border-[#E6E2D8] dark:border-[#2A2B27] shadow-2xs hover:border-[#B45309] dark:hover:border-[#E5A93C] transition-colors shrink-0"
              >
                <div className="p-1 rounded-md bg-[#FAF8F5] dark:bg-[#252723] text-[#B45309] dark:text-[#E5A93C]">
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-heading font-bold text-[#1A1B19] dark:text-[#EDEDE8] whitespace-nowrap">
                  {item.name}
                </span>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#8D9188] bg-[#F3EFE8] dark:bg-[#20211E] px-2 py-0.5 rounded-full">
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
