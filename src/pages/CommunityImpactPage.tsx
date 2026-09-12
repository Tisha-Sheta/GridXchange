import React from 'react';
import { Leaf, ShieldCheck, Zap, Award, Users, TrendingUp, ArrowUpRight } from 'lucide-react';
import { EnergyNetworkDiagram } from '../components/EnergyNetworkDiagram';

export const CommunityImpactPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 text-[#1A1B19] dark:text-[#EDEDE8] transition-colors">
      {/* Header */}
      <div className="pb-8 border-b border-[#E6E2D8] dark:border-[#262723]">
        <div className="flex items-center gap-2 text-xs font-mono text-[#2D6A4F] dark:text-[#52B788] font-semibold mb-2 uppercase tracking-wider">
          <Leaf className="w-3.5 h-3.5" />
          <span>Neighborhood Sustainability Index</span>
        </div>
        <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-[#1A1B19] dark:text-[#EDEDE8] tracking-tight">
          Community Sustainability & Grid Health
        </h1>
        <p className="text-sm text-[#686B63] dark:text-[#9EA299] mt-2">
          Quantifying the ecological and economic dividends of decentralized peer-to-peer solar dispatch
        </p>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
        <div className="bg-[#FFFFFF] dark:bg-[#171816] border border-[#E6E2D8] dark:border-[#2A2B27] rounded-3xl p-6 shadow-xs">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 rounded-2xl bg-[#E8F2EC] dark:bg-[#1A281E] text-[#2D6A4F] dark:text-[#52B788]">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-[#8D9188] uppercase block font-semibold">
                CO2 Avoided
              </span>
              <div className="font-mono text-3xl font-extrabold text-[#1A1B19] dark:text-[#EDEDE8]">116.8 kg</div>
            </div>
          </div>
          <p className="text-xs text-[#686B63] dark:text-[#8D9188] mt-3 pt-3 border-t border-[#EFECE4] dark:border-[#262723]">
            Equivalent to 5.2 mature trees planted this cycle
          </p>
        </div>

        <div className="bg-[#FFFFFF] dark:bg-[#171816] border border-[#E6E2D8] dark:border-[#2A2B27] rounded-3xl p-6 shadow-xs">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 rounded-2xl bg-[#FEF3C7] dark:bg-[#2A2312] text-[#B45309] dark:text-[#E5A93C]">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-[#8D9188] uppercase block font-semibold">
                Substation Relief
              </span>
              <div className="font-mono text-3xl font-extrabold text-[#1A1B19] dark:text-[#EDEDE8]">-18.4%</div>
            </div>
          </div>
          <p className="text-xs text-[#686B63] dark:text-[#8D9188] mt-3 pt-3 border-t border-[#EFECE4] dark:border-[#262723]">
            Midday distribution transformer thermal relief
          </p>
        </div>

        <div className="bg-[#FFFFFF] dark:bg-[#171816] border border-[#E6E2D8] dark:border-[#2A2B27] rounded-3xl p-6 shadow-xs">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 rounded-2xl bg-[#EFECE4] dark:bg-[#252723] text-[#1A1B19] dark:text-[#EDEDE8]">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-[#8D9188] uppercase block font-semibold">
                Local Wealth Kept
              </span>
              <div className="font-mono text-3xl font-extrabold text-[#1A1B19] dark:text-[#EDEDE8]">₹3,420</div>
            </div>
          </div>
          <p className="text-xs text-[#686B63] dark:text-[#8D9188] mt-3 pt-3 border-t border-[#EFECE4] dark:border-[#262723]">
            Circulated directly within the local neighborhood
          </p>
        </div>

        <div className="bg-[#FFFFFF] dark:bg-[#171816] border border-[#E6E2D8] dark:border-[#2A2B27] rounded-3xl p-6 shadow-xs">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 rounded-2xl bg-[#E8F2EC] dark:bg-[#1A281E] text-[#2D6A4F] dark:text-[#52B788]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-[#8D9188] uppercase block font-semibold">
                Resilience Rate
              </span>
              <div className="font-mono text-3xl font-extrabold text-[#2D6A4F] dark:text-[#52B788]">100%</div>
            </div>
          </div>
          <p className="text-xs text-[#686B63] dark:text-[#8D9188] mt-3 pt-3 border-t border-[#EFECE4] dark:border-[#262723]">
            Zero trade defaults via automated rebalancing
          </p>
        </div>
      </div>

      {/* Network Topology in Community Context */}
      <div className="mt-10">
        <EnergyNetworkDiagram />
      </div>

      {/* Prosumer Leaderboard & Principles */}
      <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-[#FFFFFF] dark:bg-[#171816] border border-[#E6E2D8] dark:border-[#2A2B27] rounded-3xl p-8 shadow-xs">
          <div className="flex items-center gap-2 pb-4 border-b border-[#EFECE4] dark:border-[#262723]">
            <Award className="w-5 h-5 text-[#B45309] dark:text-[#E5A93C]" />
            <h3 className="font-heading font-bold text-lg text-[#1A1B19] dark:text-[#EDEDE8]">
              Top Clean Energy Generators
            </h3>
          </div>

          <div className="divide-y divide-[#EFECE4] dark:divide-[#262723] mt-2">
            <div className="py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold text-[#B45309] bg-[#FEF3C7] dark:bg-[#2A2312] px-2.5 py-1 rounded-full">
                  #1
                </span>
                <div>
                  <div className="text-sm font-bold text-[#1A1B19] dark:text-[#EDEDE8]">
                    Rajesh Patel (P001)
                  </div>
                  <div className="text-xs text-[#8D9188]">Zone A • 6.5 kW Rooftop Solar</div>
                </div>
              </div>
              <div className="text-right font-mono text-sm">
                <div className="font-bold text-[#1A1B19] dark:text-[#EDEDE8]">284.0 kWh</div>
                <span className="text-[11px] text-[#2D6A4F] dark:text-[#52B788] font-semibold">99.2% reliability</span>
              </div>
            </div>

            <div className="py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold text-[#686B63] bg-[#EFECE4] dark:bg-[#252723] px-2.5 py-1 rounded-full">
                  #2
                </span>
                <div>
                  <div className="text-sm font-bold text-[#1A1B19] dark:text-[#EDEDE8]">
                    SolarReserve Beta (P002)
                  </div>
                  <div className="text-xs text-[#8D9188]">Zone A • 8.0 kW Rooftop + Battery</div>
                </div>
              </div>
              <div className="text-right font-mono text-sm">
                <div className="font-bold text-[#1A1B19] dark:text-[#EDEDE8]">218.5 kWh</div>
                <span className="text-[11px] text-[#2D6A4F] dark:text-[#52B788] font-semibold">98.5% reliability</span>
              </div>
            </div>

            <div className="py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold text-[#686B63] bg-[#EFECE4] dark:bg-[#252723] px-2.5 py-1 rounded-full">
                  #3
                </span>
                <div>
                  <div className="text-sm font-bold text-[#1A1B19] dark:text-[#EDEDE8]">
                    EcoHome Green (P003)
                  </div>
                  <div className="text-xs text-[#8D9188]">Zone B • 5.0 kW Solar Array</div>
                </div>
              </div>
              <div className="text-right font-mono text-sm">
                <div className="font-bold text-[#1A1B19] dark:text-[#EDEDE8]">162.0 kWh</div>
                <span className="text-[11px] text-[#2D6A4F] dark:text-[#52B788] font-semibold">96.8% reliability</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#FFFFFF] dark:bg-[#171816] border border-[#E6E2D8] dark:border-[#2A2B27] rounded-3xl p-8 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-heading font-bold text-lg text-[#1A1B19] dark:text-[#EDEDE8] mb-3">
              Microgrid Principles
            </h3>
            <p className="text-sm text-[#686B63] dark:text-[#9EA299] leading-relaxed mb-6">
              Decentralized peer-to-peer trading strengthens energy democracy by eliminating single points of failure and aligning financial incentives with carbon reduction.
            </p>

            <div className="space-y-3 text-xs text-[#686B63] dark:text-[#9EA299]">
              <div className="flex items-center gap-2.5">
                <div className="w-2 h-2 rounded-full bg-[#2D6A4F]" />
                <span>Zero transmission waste by dispatching locally within feeder limits</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-2 h-2 rounded-full bg-[#B45309]" />
                <span>Equitable price clearing ensures mutual value for buyers & sellers</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-2 h-2 rounded-full bg-[#1A1B19] dark:bg-[#EDEDE8]" />
                <span>Autonomous reserve rebalancing prevents trade defaults</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-[#EFECE4] dark:border-[#262723] text-xs font-mono text-[#8D9188]">
            Audited via Smart Distribution Telemetry
          </div>
        </div>
      </div>
    </div>
  );
};
