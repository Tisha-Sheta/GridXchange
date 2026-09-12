import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sun, Home, Zap, ArrowRight, ShieldCheck, TrendingDown, Sparkles, Activity } from 'lucide-react';
import { IMAGES } from '../constants/images';

export const CommunityNetworkHeroVisual: React.FC = () => {
  const [activeSegment, setActiveSegment] = useState<'dispatch' | 'economics' | 'resilience'>('dispatch');

  const segmentData = {
    dispatch: {
      tag: 'Direct Neighborhood Dispatch',
      title: "Rajesh's Solar Roof → Ananya's Home",
      metric: '5.0 kWh',
      submetric: 'Delivered cleanly across local feeder',
      desc: 'When you trade solar electricity with your neighbors, power travels only hundreds of meters instead of hundreds of kilometers through high-voltage utility grids.',
    },
    economics: {
      tag: 'Dynamic Fair Clearing',
      title: 'Peer Pricing: ₹7.20 / kWh',
      metric: '25% Savings',
      submetric: 'vs ₹9.50 utility benchmark',
      desc: 'Prosumers earn 2.5x more than traditional net metering credits, while consumers enjoy 20–30% lower electricity bills with zero middleman markups.',
    },
    resilience: {
      tag: 'Autonomous Rebalancing',
      title: 'Shortfall Auto-Dispatched',
      metric: '100% Continuity',
      submetric: 'Zero power dips or manual intervention',
      desc: 'If passing clouds shade a primary solar roof, GridXchange instantly routes secondary reserve solar from neighboring microgrid batteries in under 200 milliseconds.',
    },
  };

  const current = segmentData[activeSegment];

  return (
    <div className="w-full rounded-3xl overflow-hidden border border-[#E6E2D8] dark:border-[#2C2D29] bg-[#FFFFFF] dark:bg-[#171816] shadow-xl dark:shadow-2xl transition-all card-interactive">
      {/* Top Segment Tabs */}
      <div className="px-6 pt-4 pb-3 border-b border-[#E6E2D8] dark:border-[#262723] bg-[#FAF8F5]/80 dark:bg-[#121311]/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#B45309] dark:text-[#E5A93C] flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 animate-pulse" />
            <span>Telemetry Simulation</span>
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-medium">
          {[
            { id: 'dispatch', label: '1. Live Dispatch' },
            { id: 'economics', label: '2. Economics' },
            { id: 'resilience', label: '3. Resilience' },
          ].map((tab) => {
            const isActive = activeSegment === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSegment(tab.id as any)}
                className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#1A1B19] dark:bg-[#EDEDE8] text-white dark:text-[#1A1B19] font-bold shadow-2xs'
                    : 'text-[#686B63] dark:text-[#9EA299] hover:bg-[#EFECE4] dark:hover:bg-[#20211E]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Showcase: Editorial Split Layout with Real Photography */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
        {/* Left Side: Real Photography Container with Soft Gradient Overlay */}
        <div className="lg:col-span-7 relative min-h-[360px] sm:min-h-[420px] overflow-hidden group">
          <img
            src={IMAGES.modernSolarHome}
            alt="Rooftop solar home in residential neighborhood"
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-104 transition-transform duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F100E]/85 via-[#0F100E]/30 to-transparent" />

          {/* Floating Minimal Metric Badges over photo */}
          <div className="absolute top-6 left-6 right-6 flex items-center justify-between">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAF8F5]/90 dark:bg-[#1A1B18]/90 backdrop-blur-md border border-[#E6E2D8]/40 dark:border-[#3E403B]/60 text-xs font-medium text-[#1A1B19] dark:text-[#EDEDE8] shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#2D6A4F] animate-pulse" />
              <span>{current.tag}</span>
            </div>

            <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FAF8F5]/90 dark:bg-[#1A1B18]/90 backdrop-blur-md border border-[#E6E2D8]/40 dark:border-[#3E403B]/60 text-xs font-mono font-semibold text-[#1A1B19] dark:text-[#EDEDE8]">
              <span>Zero Line Loss</span>
            </div>
          </div>

          {/* Bottom Card Overlay on Image */}
          <div className="absolute bottom-6 left-6 right-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSegment}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="p-4 sm:p-5 rounded-2xl bg-[#FAF8F5]/95 dark:bg-[#171816]/95 backdrop-blur-md border border-[#E6E2D8]/80 dark:border-[#2C2D29] shadow-lg"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <span className="text-[11px] font-mono uppercase tracking-wider text-[#8D9188] block">
                      Active Telemetry
                    </span>
                    <div className="text-sm sm:text-base font-bold text-[#1A1B19] dark:text-[#EDEDE8]">
                      {current.title}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-lg font-extrabold text-[#2D6A4F] dark:text-[#52B788]">
                      {current.metric}
                    </span>
                    <div className="text-[10px] text-[#8D9188] font-mono">{current.submetric}</div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Right Side: Clean Editorial Context & Live Flow Data */}
        <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between bg-[#FAF8F5] dark:bg-[#141513]">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-mono font-semibold uppercase tracking-widest text-[#B45309] dark:text-[#E5A93C]">
                Community Network
              </span>
            </div>

            <h3 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#1A1B19] dark:text-[#EDEDE8] leading-tight">
              Energy stays local. <br />
              <span className="text-[#686B63] dark:text-[#8D9188] font-normal">
                Value stays with people.
              </span>
            </h3>

            <AnimatePresence mode="wait">
              <motion.p
                key={activeSegment}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="mt-3 text-xs sm:text-sm text-[#686B63] dark:text-[#9EA299] leading-relaxed"
              >
                {current.desc}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Human-Centered Metric List */}
          <div className="mt-6 space-y-3">
            <div className="p-3.5 rounded-2xl bg-[#FFFFFF] dark:bg-[#1D1E1B] border border-[#E6E2D8] dark:border-[#2A2B27] flex items-center justify-between card-interactive">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#FEF3C7] dark:bg-[#2E2413] text-[#B45309] dark:text-[#E5A93C] flex items-center justify-center">
                  <Sun className="w-4 h-4 fill-current" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#1A1B19] dark:text-[#EDEDE8]">Solar Producer</div>
                  <div className="text-[11px] text-[#8D9188]">Sells surplus at fair market value</div>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-[#B45309] dark:text-[#E5A93C]">
                + ₹7.20 / kWh
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#FFFFFF] dark:bg-[#1D1E1B] border border-[#E6E2D8] dark:border-[#2A2B27] flex items-center justify-between card-interactive">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#E8F2EC] dark:bg-[#1B2920] text-[#2D6A4F] dark:text-[#52B788] flex items-center justify-center">
                  <Home className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#1A1B19] dark:text-[#EDEDE8]">Local Buyer</div>
                  <div className="text-[11px] text-[#8D9188]">Saves 25% vs traditional grid rates</div>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-[#2D6A4F] dark:text-[#52B788]">
                - 25% Savings
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#FFFFFF] dark:bg-[#1D1E1B] border border-[#E6E2D8] dark:border-[#2A2B27] flex items-center justify-between card-interactive">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#EFECE4] dark:bg-[#252723] text-[#1A1B19] dark:text-[#EDEDE8] flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-[#2D6A4F] dark:text-[#52B788]" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#1A1B19] dark:text-[#EDEDE8]">Backup Guarantee</div>
                  <div className="text-[11px] text-[#8D9188]">Automated reserve if clouds pass</div>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-[#1A1B19] dark:text-[#EDEDE8]">
                100% Reliable
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

