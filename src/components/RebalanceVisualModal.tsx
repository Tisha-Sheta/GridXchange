import React from 'react';
import { X, Zap, ArrowDown, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  expectedKwh?: number;
  actualKwh?: number;
  shortfallKwh?: number;
  primarySellerName?: string;
  backupSellerName?: string;
  totalKwh?: number;
  onViewConsumerDashboard?: () => void;
}

export const RebalanceVisualModal: React.FC<Props> = ({
  isOpen,
  onClose,
  expectedKwh = 5.0,
  actualKwh = 3.5,
  shortfallKwh = 1.5,
  primarySellerName = "Seller A (Rajesh's Solar Roof)",
  backupSellerName = 'Seller B (SolarReserve Beta)',
  totalKwh = 5.0,
  onViewConsumerDashboard,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F100E]/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#FFFFFF] dark:bg-[#171816] border border-[#E6E2D8] dark:border-[#2A2B27] w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8 text-[#1A1B19] dark:text-[#EDEDE8] relative transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#EFECE4] dark:border-[#262723]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#FEF3C7] dark:bg-[#2A2312] border border-[#FDE68A] dark:border-[#3D321A] rounded-2xl text-[#B45309] dark:text-[#E5A93C]">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h3 className="font-heading font-extrabold text-lg text-[#1A1B19] dark:text-[#EDEDE8]">
                Automatic Rebalancing
              </h3>
              <p className="text-xs text-[#8D9188] font-mono">
                Microgrid Resilience in Action
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[#F3EFE8] dark:hover:bg-[#20211E] text-[#8D9188] hover:text-[#1A1B19] dark:hover:text-[#EDEDE8] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Rebalancing Visual Progression */}
        <div className="mt-6 flex flex-col items-center gap-3">
          {/* Step 1: Initial Requirement */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full bg-[#FAF8F5] dark:bg-[#1C1D1A] border border-[#E6E2D8] dark:border-[#2C2D29] rounded-2xl p-4 flex items-center justify-between"
          >
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#8D9188] block font-semibold">
                Trade Requirement
              </span>
              <span className="font-heading font-bold text-sm text-[#1A1B19] dark:text-[#EDEDE8]">
                Consumer Energy Demand
              </span>
            </div>
            <span className="font-mono text-base font-extrabold text-[#1A1B19] dark:text-[#EDEDE8]">
              {expectedKwh.toFixed(1)} kWh
            </span>
          </motion.div>

          <ArrowDown className="w-4 h-4 text-[#8D9188]" />

          {/* Step 2: Primary Output & Detected Shortfall */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="w-full bg-[#FAF8F5] dark:bg-[#1C1D1A] border border-[#E6E2D8] dark:border-[#2C2D29] rounded-2xl p-4 flex items-center justify-between"
          >
            <div>
              <div className="text-xs font-bold text-[#1A1B19] dark:text-[#EDEDE8]">
                {primarySellerName}
              </div>
              <div className="text-[11px] text-[#B45309] dark:text-[#E5A93C] font-medium">
                Cloud shadow reduced output • Shortfall of {shortfallKwh.toFixed(1)} kWh
              </div>
            </div>
            <span className="font-mono text-base font-bold text-[#B45309] dark:text-[#E5A93C]">
              {actualKwh.toFixed(1)} kWh
            </span>
          </motion.div>

          <ArrowDown className="w-4 h-4 text-[#8D9188]" />

          {/* Step 3: Automatic Secondary Dispatch */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="w-full bg-[#E8F2EC] dark:bg-[#18271D] border border-[#2D6A4F]/30 dark:border-[#52B788]/30 rounded-2xl p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-[#2D6A4F] dark:text-[#52B788]" />
              <div>
                <div className="text-xs font-bold text-[#2D6A4F] dark:text-[#52B788]">
                  {backupSellerName}
                </div>
                <div className="text-[11px] text-[#2D6A4F]/80 dark:text-[#52B788]/80">
                  Automatically routed shortfall reserve
                </div>
              </div>
            </div>
            <span className="font-mono text-base font-bold text-[#2D6A4F] dark:text-[#52B788]">
              +{shortfallKwh.toFixed(1)} kWh
            </span>
          </motion.div>

          <ArrowDown className="w-4 h-4 text-[#8D9188]" />

          {/* Step 4: 100% Fulfilled Result */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="w-full bg-[#1A1B19] dark:bg-[#EDEDE8] text-white dark:text-[#1A1B19] rounded-2xl p-5 shadow-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#52B788] dark:text-[#2D6A4F]" />
                <span className="font-heading font-bold text-sm">
                  100% Energy Fulfilled
                </span>
              </div>
              <span className="font-mono text-xl font-extrabold">
                {totalKwh.toFixed(1)} kWh
              </span>
            </div>
            <p className="text-xs text-[#D1CCC0] dark:text-[#4A4D45]">
              Your energy requirement was automatically fulfilled. No manual intervention was required.
            </p>
          </motion.div>
        </div>

        {/* Footer Actions */}
        <div className="mt-8 flex items-center gap-3">
          {onViewConsumerDashboard && (
            <button
              onClick={onViewConsumerDashboard}
              className="flex-1 py-3.5 bg-[#1A1B19] dark:bg-[#EDEDE8] hover:bg-[#2C2D29] text-white dark:text-[#1A1B19] font-bold text-xs rounded-full transition-colors cursor-pointer"
            >
              View in Consumer Dashboard
            </button>
          )}
          <button
            onClick={onClose}
            className="px-6 py-3.5 bg-[#FFFFFF] dark:bg-[#1E1F1C] hover:bg-[#F3EFE8] text-[#1A1B19] dark:text-[#EDEDE8] font-semibold text-xs rounded-full border border-[#E6E2D8] dark:border-[#2C2D29] transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
