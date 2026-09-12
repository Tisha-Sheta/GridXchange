import React from 'react';
import { Sun, Home, Cpu, Zap, ArrowRight, ShieldCheck } from 'lucide-react';

interface Props {
  activeTrade?: {
    sellerId?: string;
    buyerId?: string;
    isRebalanced?: boolean;
    backupSellerId?: string;
  };
  compact?: boolean;
}

export const EnergyNetworkDiagram: React.FC<Props> = ({ activeTrade, compact = false }) => {
  return (
    <div className={`w-full bg-[#FFFFFF] dark:bg-[#171816] border border-[#E6E2D8] dark:border-[#2A2B27] rounded-3xl p-6 sm:p-8 overflow-hidden relative shadow-xs transition-colors ${compact ? 'py-5' : 'py-8'}`}>
      {/* Header ribbon */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-[#EFECE4] dark:border-[#262723] gap-4">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-[#2D6A4F] animate-pulse" />
          <div>
            <h3 className="font-heading font-bold text-base text-[#1A1B19] dark:text-[#EDEDE8]">
              Neighborhood Microgrid Dispatch Topology
            </h3>
            <span className="text-xs text-[#8D9188] block">
              Autonomous Peer-to-Peer Physical & Virtual Dispatch Matrix
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono text-[#8D9188]">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E5A93C] inline-block" />
            <span>Solar Prosumers</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#686B63] inline-block" />
            <span>Distribution Hubs</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2D6A4F] inline-block" />
            <span>Local Consumers</span>
          </div>
        </div>
      </div>

      {/* 3-Column Diagram */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
        {/* Column 1: Solar Generation */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-1 border-b border-[#EFECE4] dark:border-[#262723]">
            <span className="text-xs font-mono uppercase text-[#8D9188] font-semibold">
              01 • Local Solar
            </span>
            <span className="text-xs font-mono text-[#1A1B19] dark:text-[#EDEDE8]">16.0 kW Capacity</span>
          </div>

          <div className="p-5 bg-[#FAF8F5] dark:bg-[#1C1D1A] border border-[#E6E2D8] dark:border-[#2C2D29] rounded-2xl">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-[#FEF3C7] dark:bg-[#2A2312] text-[#B45309] dark:text-[#E5A93C] rounded-xl">
                  <Sun className="w-4 h-4 fill-current" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#1A1B19] dark:text-[#EDEDE8]">Rajesh Patel (P001)</div>
                  <div className="text-[11px] text-[#8D9188]">6.5 kW Rooftop • Zone A</div>
                </div>
              </div>
              <span className="font-mono text-xs font-bold text-[#2D6A4F] dark:text-[#52B788]">
                99.2%
              </span>
            </div>

            <div className="mt-3 pt-3 border-t border-[#EFECE4] dark:border-[#262723] grid grid-cols-2 text-xs font-mono">
              <div>
                <span className="text-[#8D9188] block text-[10px]">SURPLUS</span>
                <span className="font-bold text-[#1A1B19] dark:text-[#EDEDE8]">6.2 kWh</span>
              </div>
              <div>
                <span className="text-[#8D9188] block text-[10px]">STATUS</span>
                <span className="font-bold text-[#2D6A4F] dark:text-[#52B788]">Active Dispatch</span>
              </div>
            </div>
          </div>

          <div className="p-5 bg-[#FAF8F5] dark:bg-[#1C1D1A] border border-[#E6E2D8] dark:border-[#2C2D29] rounded-2xl">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-[#FEF3C7] dark:bg-[#2A2312] text-[#B45309] dark:text-[#E5A93C] rounded-xl">
                  <Sun className="w-4 h-4 fill-current" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#1A1B19] dark:text-[#EDEDE8]">SolarReserve Beta (P002)</div>
                  <div className="text-[11px] text-[#8D9188]">8.0 kW Solar + Battery</div>
                </div>
              </div>
              <span className="font-mono text-xs font-bold text-[#2D6A4F] dark:text-[#52B788]">
                98.5%
              </span>
            </div>

            <div className="mt-3 pt-3 border-t border-[#EFECE4] dark:border-[#262723] grid grid-cols-2 text-xs font-mono">
              <div>
                <span className="text-[#8D9188] block text-[10px]">STANDBY RESERVE</span>
                <span className="font-bold text-[#1A1B19] dark:text-[#EDEDE8]">4.5 kWh</span>
              </div>
              <div>
                <span className="text-[#8D9188] block text-[10px]">RESERVE ROLE</span>
                <span className="font-bold text-[#B45309] dark:text-[#E5A93C]">Auto-Backup</span>
              </div>
            </div>
          </div>
        </div>

        {/* Column 2: Neighborhood Grid Hub */}
        <div className="space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-1 border-b border-[#EFECE4] dark:border-[#262723]">
            <span className="text-xs font-mono uppercase text-[#8D9188] font-semibold">
              02 • Neighborhood Hub
            </span>
            <span className="text-xs font-mono text-[#2D6A4F] dark:text-[#52B788]">Low Congestion</span>
          </div>

          <div className="p-6 bg-[#FAF8F5] dark:bg-[#1C1D1A] border border-[#E6E2D8] dark:border-[#2C2D29] rounded-2xl flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-[#EFECE4] dark:bg-[#252723] text-[#1A1B19] dark:text-[#EDEDE8] rounded-xl">
                  <Zap className="w-5 h-5 text-[#B45309] dark:text-[#E5A93C] fill-current" />
                </div>
                <div>
                  <h4 className="font-heading font-bold text-sm text-[#1A1B19] dark:text-[#EDEDE8]">
                    Feeder Zone A Substation
                  </h4>
                  <span className="text-xs text-[#8D9188]">400m Local Feeder Range</span>
                </div>
              </div>

              <p className="text-xs text-[#686B63] dark:text-[#9EA299] leading-relaxed">
                Direct peer routing over existing residential wiring with minimal transmission friction (&lt;0.8% loss).
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-[#EFECE4] dark:border-[#262723] space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-[#8D9188]">Transformer Load:</span>
                <span className="font-bold text-[#1A1B19] dark:text-[#EDEDE8]">32.4% (Optimal)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8D9188]">Wheeling Tariff:</span>
                <span className="font-bold text-[#2D6A4F] dark:text-[#52B788]">₹0.00 (Zero Peak Fee)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Column 3: Local Consumers */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-1 border-b border-[#EFECE4] dark:border-[#262723]">
            <span className="text-xs font-mono uppercase text-[#8D9188] font-semibold">
              03 • Consumers
            </span>
            <span className="text-xs font-mono text-[#1A1B19] dark:text-[#EDEDE8]">Active Demand</span>
          </div>

          <div className="p-5 bg-[#FAF8F5] dark:bg-[#1C1D1A] border border-[#E6E2D8] dark:border-[#2C2D29] rounded-2xl">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-[#E8F2EC] dark:bg-[#1B2920] text-[#2D6A4F] dark:text-[#52B788] rounded-xl">
                  <Home className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#1A1B19] dark:text-[#EDEDE8]">Ananya Sharma (C001)</div>
                  <div className="text-[11px] text-[#8D9188]">Zone A • 5.0 kWh Demand</div>
                </div>
              </div>
              <span className="font-mono text-xs font-bold text-[#2D6A4F] dark:text-[#52B788]">
                -25% Bill
              </span>
            </div>

            <div className="mt-3 pt-3 border-t border-[#EFECE4] dark:border-[#262723] grid grid-cols-2 text-xs font-mono">
              <div>
                <span className="text-[#8D9188] block text-[10px]">SCHEDULED</span>
                <span className="font-bold text-[#1A1B19] dark:text-[#EDEDE8]">2–3 PM</span>
              </div>
              <div>
                <span className="text-[#8D9188] block text-[10px]">BACKUP PROMISE</span>
                <span className="font-bold text-[#2D6A4F] dark:text-[#52B788]">100% Protected</span>
              </div>
            </div>
          </div>

          <div className="p-5 bg-[#FAF8F5] dark:bg-[#1C1D1A] border border-[#E6E2D8] dark:border-[#2C2D29] rounded-2xl">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-[#E8F2EC] dark:bg-[#1B2920] text-[#2D6A4F] dark:text-[#52B788] rounded-xl">
                  <Home className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#1A1B19] dark:text-[#EDEDE8]">Alex Rivera (C002)</div>
                  <div className="text-[11px] text-[#8D9188]">Zone A • 3.5 kWh Demand</div>
                </div>
              </div>
              <span className="font-mono text-xs font-bold text-[#2D6A4F] dark:text-[#52B788]">
                -22% Bill
              </span>
            </div>

            <div className="mt-3 pt-3 border-t border-[#EFECE4] dark:border-[#262723] grid grid-cols-2 text-xs font-mono">
              <div>
                <span className="text-[#8D9188] block text-[10px]">SCHEDULED</span>
                <span className="font-bold text-[#1A1B19] dark:text-[#EDEDE8]">3–4 PM</span>
              </div>
              <div>
                <span className="text-[#8D9188] block text-[10px]">SOURCE</span>
                <span className="font-bold text-[#1A1B19] dark:text-[#EDEDE8]">Local Solar</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
