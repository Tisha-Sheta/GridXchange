import React from 'react';
import { TradeStatus } from '../types';
import { CheckCircle2, Clock, Zap } from 'lucide-react';

interface Props {
  currentStatus: TradeStatus;
  isRebalanced?: boolean;
}

const STEPS: { key: TradeStatus; label: string }[] = [
  { key: 'Matched', label: '1. Matched' },
  { key: 'Confirmed', label: '2. Confirmed' },
  { key: 'Scheduled', label: '3. Scheduled' },
  { key: 'Meter Verified', label: '4. Meter Verified' },
  { key: 'Settled', label: '5. Settled' },
];

export const LifecycleStepper: React.FC<Props> = ({ currentStatus, isRebalanced }) => {
  const getStepIndex = (status: TradeStatus): number => {
    switch (status) {
      case 'Matched': return 0;
      case 'Confirmed': return 1;
      case 'Scheduled': return 2;
      case 'Meter Verified': return 3;
      case 'Rebalanced': return 3; // Rebalanced is branch at meter verification
      case 'Partially Fulfilled': return 3;
      case 'Settled': return 4;
      default: return 0;
    }
  };

  const currentIndex = getStepIndex(currentStatus);

  return (
    <div className="w-full py-2">
      <div className="flex items-center justify-between relative">
        {/* Connecting track line */}
        <div className="absolute top-1/2 left-4 right-4 -translate-y-1/2 h-0.5 bg-slate-200 z-0" />
        <div
          className="absolute top-1/2 left-4 -translate-y-1/2 h-0.5 bg-emerald-500 transition-all duration-500 z-0"
          style={{ width: `${Math.min(100, (currentIndex / (STEPS.length - 1)) * 94)}%` }}
        />

        {STEPS.map((step, idx) => {
          const isCompleted = idx < currentIndex || (idx === currentIndex && currentStatus === 'Settled');
          const isCurrent = idx === currentIndex && currentStatus !== 'Settled';
          const isRebalancedStep = isRebalanced && idx === 3;

          return (
            <div key={step.key} className="flex flex-col items-center relative z-10">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs font-semibold transition-all ${
                  isCompleted
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-500 shadow-xs'
                    : isCurrent
                    ? isRebalancedStep
                      ? 'bg-[#FEF3C7] text-amber-800 border-2 border-amber-500 shadow-xs'
                      : 'bg-[#E0EDFD] text-[#0A2558] border-2 border-[#1D4ED8] shadow-xs'
                    : 'bg-white text-slate-400 border border-slate-200'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : isCurrent ? (
                  isRebalancedStep ? (
                    <Zap className="w-4 h-4 text-amber-600 fill-amber-500" />
                  ) : (
                    <Clock className="w-4 h-4 text-[#1D4ED8]" />
                  )
                ) : (
                  <span>{idx + 1}</span>
                )}
              </div>
              <span
                className={`text-[11px] font-medium mt-1.5 whitespace-nowrap ${
                  isCompleted
                    ? 'text-emerald-700 font-semibold'
                    : isCurrent
                    ? 'text-[#0B1B3D] font-bold'
                    : 'text-slate-500'
                }`}
              >
                {isRebalancedStep ? '4. Rebalanced' : step.label}
              </span>
            </div>
          );
        })}
      </div>

      {isRebalanced && (
        <div className="mt-3 bg-[#FEF3C7]/60 border border-amber-300/80 rounded-xl p-3 flex items-center gap-2.5 text-xs text-amber-900">
          <Zap className="w-4 h-4 text-amber-600 shrink-0 fill-amber-500" />
          <span>
            <strong className="font-semibold text-amber-950">Autonomous Rebalance Dispatched:</strong> Primary prosumer shortfall was automatically reallocated to backup microgrid reserves without interrupting delivery.
          </span>
        </div>
      )}
    </div>
  );
};

