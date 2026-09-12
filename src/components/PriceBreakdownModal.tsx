import React from 'react';
import { PriceBreakdown } from '../types';
import { X, Calculator, ShieldCheck } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  breakdown: PriceBreakdown | null;
  listingName?: string;
  zoneName?: string;
}

export const PriceBreakdownModal: React.FC<Props> = ({
  isOpen,
  onClose,
  breakdown,
  listingName,
  zoneName,
}) => {
  if (!isOpen || !breakdown) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F100E]/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#FFFFFF] dark:bg-[#171816] border border-[#E6E2D8] dark:border-[#2A2B27] w-full max-w-md rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8 text-[#1A1B19] dark:text-[#EDEDE8] relative transition-colors">
        <div className="flex items-center justify-between pb-4 border-b border-[#EFECE4] dark:border-[#262723]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#EFECE4] dark:bg-[#252723] rounded-xl text-[#1A1B19] dark:text-[#EDEDE8]">
              <Calculator className="w-5 h-5 text-[#B45309] dark:text-[#E5A93C]" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-base text-[#1A1B19] dark:text-[#EDEDE8]">Dynamic Tariff Breakdown</h3>
              <p className="text-xs text-[#8D9188]">Transparent, auditable 4-factor formula</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#F3EFE8] dark:hover:bg-[#20211E] text-[#8D9188] hover:text-[#1A1B19] dark:hover:text-[#EDEDE8] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {listingName && (
          <div className="mt-4 bg-[#FAF8F5] dark:bg-[#1C1D1A] border border-[#E6E2D8] dark:border-[#2C2D29] rounded-2xl p-3.5 flex justify-between text-xs font-mono">
            <span className="text-[#8D9188]">Matched Provider:</span>
            <span className="font-bold text-[#1A1B19] dark:text-[#EDEDE8]">{listingName}</span>
          </div>
        )}

        {/* Formula breakdown */}
        <div className="mt-4 space-y-2.5">
          <div className="p-3.5 bg-[#FAF8F5] dark:bg-[#1C1D1A] rounded-2xl border border-[#E6E2D8] dark:border-[#2C2D29] flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-[#1A1B19] dark:text-[#EDEDE8]">1. Base Generation Tariff</div>
              <div className="text-[11px] text-[#8D9188]">Benchmark solar production cost</div>
            </div>
            <div className="font-mono text-sm font-bold text-[#1A1B19] dark:text-[#EDEDE8]">
              ₹{breakdown.base_price.toFixed(2)}
            </div>
          </div>

          <div className="p-3.5 bg-[#FAF8F5] dark:bg-[#1C1D1A] rounded-2xl border border-[#E6E2D8] dark:border-[#2C2D29] flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-[#1A1B19] dark:text-[#EDEDE8]">2. Time-of-Use Demand Factor</div>
              <div className="text-[11px] text-[#8D9188]">Peak midday window ratio</div>
            </div>
            <div className="font-mono text-sm font-bold text-[#1A1B19] dark:text-[#EDEDE8]">
              +₹{breakdown.demand_factor.toFixed(2)}
            </div>
          </div>

          <div className="p-3.5 bg-[#FAF8F5] dark:bg-[#1C1D1A] rounded-2xl border border-[#E6E2D8] dark:border-[#2C2D29] flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-[#1A1B19] dark:text-[#EDEDE8]">3. Prosumer Supply Factor</div>
              <div className="text-[11px] text-[#8D9188]">Surplus availability index</div>
            </div>
            <div className="font-mono text-sm font-bold text-[#1A1B19] dark:text-[#EDEDE8]">
              +₹{breakdown.supply_factor.toFixed(2)}
            </div>
          </div>

          <div className="p-3.5 bg-[#FAF8F5] dark:bg-[#1C1D1A] rounded-2xl border border-[#E6E2D8] dark:border-[#2C2D29] flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-[#1A1B19] dark:text-[#EDEDE8]">4. Grid Congestion Surcharge</div>
              <div className="text-[11px] text-[#8D9188]">
                {zoneName || 'Zone A'}: Optimal flow
              </div>
            </div>
            <div className="font-mono text-sm font-bold text-[#2D6A4F] dark:text-[#52B788]">
              {breakdown.congestion_factor === 0 ? '₹0.00' : `+₹${breakdown.congestion_factor.toFixed(2)}`}
            </div>
          </div>
        </div>

        {/* Divider & Total */}
        <div className="mt-5 pt-4 border-t border-[#EFECE4] dark:border-[#262723] flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#8D9188]">Final Transparent Price</div>
            <div className="text-[11px] text-[#2D6A4F] dark:text-[#52B788] flex items-center gap-1 mt-0.5 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" /> Direct neighborhood rate
            </div>
          </div>
          <div className="text-right">
            <span className="font-mono text-2xl font-extrabold text-[#1A1B19] dark:text-[#EDEDE8]">
              ₹{breakdown.final_price.toFixed(2)}
            </span>
            <span className="text-xs text-[#8D9188] font-mono ml-1">/ kWh</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full py-3.5 bg-[#1A1B19] dark:bg-[#EDEDE8] hover:bg-[#2C2D29] text-white dark:text-[#1A1B19] font-bold text-xs rounded-full transition-colors cursor-pointer shadow-sm"
        >
          Close Pricing Audit
        </button>
      </div>
    </div>
  );
};
