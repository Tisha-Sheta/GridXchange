import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/apiClient';
import { MatchRecord, Trade, EnergyRequirement, EnergyListing } from '../types';
import {
  Zap,
  Home,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Sparkles,
  Info,
  TrendingUp,
  MapPin,
  Calendar,
  Layers,
  User as UserIcon,
  Receipt,
  FileText,
  Activity,
} from 'lucide-react';

interface Props {
  onTriggerRebalanceDemo: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const ConsumerDashboard: React.FC<Props> = ({ onTriggerRebalanceDemo, onNavigateTab }) => {
  const { user, roleData, refreshProfile } = useAuth();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [requirements, setRequirements] = useState<EnergyRequirement[]>([]);
  const [availableListings, setAvailableListings] = useState<EnergyListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [settlingTradeId, setSettlingTradeId] = useState<string | null>(null);
  const [settlementSuccessMsg, setSettlementSuccessMsg] = useState<string | null>(null);

  // Sub-navigation: 'overview' | 'find_form' | 'searching' | 'matches' | 'trade_confirmed' | 'active_trades' | 'history' | 'profile'
  const [currentView, setCurrentView] = useState<
    'overview' | 'find_form' | 'searching' | 'matches' | 'trade_confirmed' | 'active_trades' | 'history' | 'profile'
  >('overview');

  // Find Energy Form inputs
  const [reqQty, setReqQty] = useState(0);
  const [reqTimeSlot, setReqTimeSlot] = useState('');
  const [reqMaxPrice, setReqMaxPrice] = useState(0);

  // Match State
  const [matches, setMatches] = useState<MatchRecord[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<MatchRecord | null>(null);
  const [showWhyMatch, setShowWhyMatch] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [confirmedTradeData, setConfirmedTradeData] = useState<Trade | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [allTrades, allReqs, allListings] = await Promise.all([
        api.getTrades().catch(() => []),
        api.getRequirements().catch(() => []),
        api.getListings('Available').catch(() => []),
      ]);
      setTrades(allTrades);
      setRequirements(allReqs);
      setAvailableListings(allListings);

      // If user has an open requirement and matches state is empty, load matches from API
      if (allReqs.length > 0) {
        const latestReq = allReqs[allReqs.length - 1];
        const reqMatches = await api.getMatches(latestReq.id).catch(() => []);
        if (reqMatches && reqMatches.length > 0) {
          setMatches((prev) => (prev.length > 0 ? prev : reqMatches));
          setSelectedMatch((prev) => prev || reqMatches[0]);
        }
      }
    } catch (err) {
      console.error('Error loading consumer data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleSimulateDelivery = async (tradeId: string) => {
    setSettlingTradeId(tradeId);
    setSettlementSuccessMsg(null);
    try {
      const res = await api.simulateDelivery(tradeId);
      await Promise.all([loadData(), refreshProfile()]);
      setSettlementSuccessMsg(res.message || 'Delivery simulated and trade settled successfully!');
      setTimeout(() => {
        setSettlementSuccessMsg(null);
      }, 7000);
    } catch (err: any) {
      console.error('Failed to simulate delivery:', err);
    } finally {
      setSettlingTradeId(null);
    }
  };

  // Filter trades for this consumer
  const activeTrades = trades.filter((t) => t.status !== 'Settled' && t.status !== 'Cancelled');
  const pastTrades = trades.filter((t) => t.status === 'Settled' || t.status === 'Cancelled');
  const primaryActiveTrade = activeTrades[0];

  const handleStartFindEnergy = () => {
    setCurrentView('find_form');
  };

  const handleFindMatches = async (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentView('searching');

    try {
      const res = await api.createRequirement({
        quantity: reqQty,
        max_price: reqMaxPrice,
        start_time: '14:00',
        end_time: '15:00',
        preferred_zone: user?.location || 'Zone A',
      });

      const matchList = res.matches && res.matches.length > 0
        ? res.matches
        : (res.requirement?.id ? await api.getMatches(res.requirement.id) : []);

      setMatches(matchList || []);
      if (matchList && matchList.length > 0) {
        setSelectedMatch(matchList[0]);
      } else {
        setSelectedMatch(null);
      }
      setCurrentView('matches');
    } catch (err) {
      console.error('Error finding matches:', err);
      setMatches([]);
      setSelectedMatch(null);
      setCurrentView('matches');
    }
  };

  const handleConfirmTrade = async (matchToConfirm?: MatchRecord) => {
    const targetMatch = matchToConfirm || selectedMatch || matches[0];
    if (!targetMatch) return;
    setSelectedMatch(targetMatch);
    setConfirming(true);
    try {
      const price = targetMatch.pricing_breakdown?.final_price || targetMatch.listing?.price || 7.5;
      const createdTrade = await api.confirmTrade({
        listing_id: targetMatch.listing_id,
        requirement_id: targetMatch.requirement_id,
        quantity: reqQty,
        price,
      });
      await loadData();
      setConfirmedTradeData(createdTrade);
      setCurrentView('trade_confirmed');
    } catch (err: any) {
      console.error('Error confirming trade:', err);
      setCurrentView('trade_confirmed');
    } finally {
      setConfirming(false);
    }
  };

  const userName = user?.name || 'Ananya Sharma';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 transition-colors">
      {/* Sub-navigation Ribbon */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#E6E2D8] dark:border-[#262723]">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#2D6A4F] dark:text-[#52B788]">
            Consumer Portal
          </span>
          <span className="text-xs font-mono text-[#8D9188]">• {user?.email}</span>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <button
            onClick={() => setCurrentView('overview')}
            className={`px-3.5 py-1.5 rounded-full transition-colors cursor-pointer ${currentView === 'overview'
                ? 'bg-[#1A1B19] text-white dark:bg-[#EDEDE8] dark:text-[#1A1B19] font-bold'
                : 'hover:bg-[#EFECE4] dark:hover:bg-[#1E1F1C] text-[#686B63] dark:text-[#8D9188]'
              }`}
          >
            Overview
          </button>
          <button
            onClick={() => setCurrentView('find_form')}
            className={`px-3.5 py-1.5 rounded-full transition-colors cursor-pointer ${currentView === 'find_form' || currentView === 'matches'
                ? 'bg-[#1A1B19] text-white dark:bg-[#EDEDE8] dark:text-[#1A1B19] font-bold'
                : 'hover:bg-[#EFECE4] dark:hover:bg-[#1E1F1C] text-[#686B63] dark:text-[#8D9188]'
              }`}
          >
            Find Energy
          </button>
          <button
            onClick={() => setCurrentView('active_trades')}
            className={`px-3.5 py-1.5 rounded-full transition-colors cursor-pointer ${currentView === 'active_trades'
                ? 'bg-[#1A1B19] text-white dark:bg-[#EDEDE8] dark:text-[#1A1B19] font-bold'
                : 'hover:bg-[#EFECE4] dark:hover:bg-[#1E1F1C] text-[#686B63] dark:text-[#8D9188]'
              }`}
          >
            Active Trades ({activeTrades.length})
          </button>
          <button
            onClick={() => setCurrentView('history')}
            className={`px-3.5 py-1.5 rounded-full transition-colors cursor-pointer ${currentView === 'history'
                ? 'bg-[#1A1B19] text-white dark:bg-[#EDEDE8] dark:text-[#1A1B19] font-bold'
                : 'hover:bg-[#EFECE4] dark:hover:bg-[#1E1F1C] text-[#686B63] dark:text-[#8D9188]'
              }`}
          >
            Trade History
          </button>
          {onNavigateTab && (
            <button
              onClick={() => onNavigateTab('impact')}
              className="px-3.5 py-1.5 rounded-full transition-colors hover:bg-[#EFECE4] dark:hover:bg-[#1E1F1C] text-[#686B63] dark:text-[#8D9188] cursor-pointer"
            >
              Impact
            </button>
          )}
          <button
            onClick={() => setCurrentView('profile')}
            className={`px-3.5 py-1.5 rounded-full transition-colors cursor-pointer ${currentView === 'profile'
                ? 'bg-[#1A1B19] text-white dark:bg-[#EDEDE8] dark:text-[#1A1B19] font-bold'
                : 'hover:bg-[#EFECE4] dark:hover:bg-[#1E1F1C] text-[#686B63] dark:text-[#8D9188]'
              }`}
          >
            Profile
          </button>
        </div>
      </div>

      {/* =========================================================
          VIEW 1: PRIMARY OVERVIEW SCREEN
          ========================================================= */}
      {currentView === 'overview' && (
        <div className="space-y-12">
          {/* Main Greeting & Dominant Primary CTA */}
          <div className="p-8 sm:p-12 rounded-3xl bg-[#FFFFFF] dark:bg-[#171816] border border-[#E6E2D8] dark:border-[#2A2B27] shadow-sm">
            <div className="max-w-2xl">
              <span className="text-xs font-mono font-semibold uppercase tracking-widest text-[#B45309] dark:text-[#E5A93C] block mb-2">
                Good morning, {userName}
              </span>
              <h1 className="font-heading text-3xl sm:text-5xl font-extrabold text-[#1A1B19] dark:text-[#EDEDE8] tracking-tight">
                What would you like to do?
              </h1>
              <p className="mt-4 text-base text-[#686B63] dark:text-[#9EA299] leading-relaxed">
                Connect directly with neighborhood solar prosumers to purchase clean, verified electricity at 20–30% below utility rates.
              </p>

              {/* Large Primary Action */}
              <div className="mt-8">
                <button
                  onClick={handleStartFindEnergy}
                  className="w-full sm:w-auto px-10 py-5 rounded-full bg-[#1A1B19] dark:bg-[#EDEDE8] hover:bg-[#2C2D29] dark:hover:bg-[#FFFFFF] text-white dark:text-[#1A1B19] font-heading font-extrabold text-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-3 cursor-pointer"
                >
                  <span>FIND ENERGY</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Useful Summary Information */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading text-xl font-bold text-[#1A1B19] dark:text-[#EDEDE8]">
                Your Energy Summary
              </h2>
              <button
                onClick={onTriggerRebalanceDemo}
                className="text-xs font-mono text-[#B45309] dark:text-[#E5A93C] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Zap className="w-3 h-3 fill-current" />
                <span>Test Auto-Rebalance</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Stat 1: Energy Needed */}
              <div
                onClick={() => setCurrentView('find_form')}
                className="p-6 rounded-3xl bg-[#FFFFFF] dark:bg-[#171816] border border-[#E6E2D8] dark:border-[#2A2B27] shadow-xs flex flex-col justify-between cursor-pointer hover:border-[#B45309] transition-all"
              >
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[#8D9188] block mb-1">
                    Energy Needed
                  </span>
                  <div className="font-mono text-3xl font-extrabold text-[#1A1B19] dark:text-[#EDEDE8]">
                    {reqQty} kWh
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-[#EFECE4] dark:border-[#262723] text-xs text-[#686B63] dark:text-[#8D9188] flex items-center justify-between">
                  <span>Window: {reqTimeSlot.split(' ')[0]}</span>
                  <span className="text-[#B45309] font-bold">Configure →</span>
                </div>
              </div>

              {/* Stat 2: Active Trade */}
              <div
                onClick={() => setCurrentView('active_trades')}
                className="p-6 rounded-3xl bg-[#FFFFFF] dark:bg-[#171816] border border-[#E6E2D8] dark:border-[#2A2B27] shadow-xs flex flex-col justify-between cursor-pointer hover:border-[#2D6A4F] transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-[#8D9188]">
                      Active Trades
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#E8F2EC] dark:bg-[#1B2920] text-[#2D6A4F] dark:text-[#52B788] font-semibold">
                      {activeTrades.length} Active
                    </span>
                  </div>
                  <div className="font-mono text-3xl font-extrabold text-[#2D6A4F] dark:text-[#52B788]">
                    {primaryActiveTrade ? `${primaryActiveTrade.quantity} kWh` : '0 kWh'}
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-[#EFECE4] dark:border-[#262723] text-xs text-[#686B63] dark:text-[#8D9188]">
                  {primaryActiveTrade ? `Status: ${primaryActiveTrade.status}` : 'No active trade'}
                </div>
              </div>

              {/* Stat 3: Savings */}
              <div
                onClick={() => setCurrentView('profile')}
                className="p-6 rounded-3xl bg-[#FFFFFF] dark:bg-[#171816] border border-[#E6E2D8] dark:border-[#2A2B27] shadow-xs flex flex-col justify-between cursor-pointer hover:border-[#1A1B19] transition-all"
              >
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[#8D9188] block mb-1">
                    Lifetime Savings
                  </span>
                  <div className="font-mono text-3xl font-extrabold text-[#B45309] dark:text-[#E5A93C]">
                    ₹{roleData?.total_savings ?? 0}
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-[#EFECE4] dark:border-[#262723] text-xs text-[#686B63] dark:text-[#8D9188]">
                  25% cheaper than standard utility rates
                </div>
              </div>
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="pt-6 border-t border-[#E6E2D8] dark:border-[#262723]">
            <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-[#686B63] dark:text-[#8D9188]">
              <span className="font-semibold uppercase tracking-wider text-[#8D9188]">
                Quick Actions:
              </span>
              <button
                onClick={() => setCurrentView('find_form')}
                className="px-4 py-2 rounded-full border border-[#E6E2D8] dark:border-[#2C2D29] hover:bg-[#F3EFE8] dark:hover:bg-[#1F201C] transition-colors cursor-pointer"
              >
                Set Requirements
              </button>
              <button
                onClick={() => setCurrentView('active_trades')}
                className="px-4 py-2 rounded-full border border-[#E6E2D8] dark:border-[#2C2D29] hover:bg-[#F3EFE8] dark:hover:bg-[#1F201C] transition-colors cursor-pointer"
              >
                Active Trades ({activeTrades.length})
              </button>
              <button
                onClick={() => setCurrentView('history')}
                className="px-4 py-2 rounded-full border border-[#E6E2D8] dark:border-[#2C2D29] hover:bg-[#F3EFE8] dark:hover:bg-[#1F201C] transition-colors cursor-pointer"
              >
                Trade History ({pastTrades.length})
              </button>
              <button
                onClick={() => setCurrentView('profile')}
                className="px-4 py-2 rounded-full border border-[#E6E2D8] dark:border-[#2C2D29] hover:bg-[#F3EFE8] dark:hover:bg-[#1F201C] transition-colors cursor-pointer"
              >
                Account Profile & Meter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          VIEW 2: FIND ENERGY FORM
          ========================================================= */}
      {currentView === 'find_form' && (
        <div className="max-w-2xl mx-auto">
          <div className="p-8 sm:p-12 rounded-3xl bg-[#FFFFFF] dark:bg-[#171816] border border-[#E6E2D8] dark:border-[#2A2B27] shadow-sm">
            <div className="mb-8">
              <span className="text-xs font-mono font-semibold uppercase tracking-widest text-[#B45309] dark:text-[#E5A93C] block mb-2">
                Marketplace Search
              </span>
              <h2 className="font-heading text-3xl font-extrabold text-[#1A1B19] dark:text-[#EDEDE8]">
                Find Renewable Energy
              </h2>
              <p className="mt-2 text-sm text-[#686B63] dark:text-[#9EA299]">
                Specify your energy requirements to discover optimal solar matches across registered neighborhood producers.
              </p>
            </div>

            <form onSubmit={handleFindMatches} className="space-y-6">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#8D9188] mb-2 font-semibold">
                  How much energy do you need?
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="1"
                    max="50"
                    step="0.5"
                    value={reqQty}
                    onChange={(e) => setReqQty(Number(e.target.value))}
                    className="flex-1 px-5 py-4 rounded-2xl border border-[#E6E2D8] dark:border-[#2C2D29] bg-[#FAF8F5] dark:bg-[#111210] font-mono text-xl font-bold text-[#1A1B19] dark:text-[#EDEDE8] focus:outline-none focus:border-[#B45309]"
                    required
                  />
                  <span className="font-mono text-lg font-bold text-[#686B63]">kWh</span>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  {[3.0, 5.0, 8.0, 12.0].map((qty) => (
                    <button
                      type="button"
                      key={qty}
                      onClick={() => setReqQty(qty)}
                      className={`px-3 py-1 rounded-full text-xs font-mono transition-colors cursor-pointer ${reqQty === qty
                          ? 'bg-[#1A1B19] dark:bg-[#EDEDE8] text-white dark:text-[#1A1B19] font-bold'
                          : 'bg-[#F3EFE8] dark:bg-[#1E1F1C] text-[#686B63] hover:bg-[#E5E0D4]'
                        }`}
                    >
                      {qty} kWh
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#8D9188] mb-2 font-semibold">
                  When do you need it?
                </label>
                <select
                  value={reqTimeSlot}
                  onChange={(e) => setReqTimeSlot(e.target.value)}
                  className="w-full px-5 py-4 rounded-2xl border border-[#E6E2D8] dark:border-[#2C2D29] bg-[#FAF8F5] dark:bg-[#111210] font-sans text-base text-[#1A1B19] dark:text-[#EDEDE8] focus:outline-none focus:border-[#B45309] cursor-pointer"
                >
                  <option value="2:00 PM — 3:00 PM">2:00 PM — 3:00 PM (Peak Solar Generation)</option>
                  <option value="3:00 PM — 4:00 PM">3:00 PM — 4:00 PM (Afternoon Sun)</option>
                  <option value="1:00 PM — 2:00 PM">1:00 PM — 2:00 PM (Midday Sun)</option>
                  <option value="4:00 PM — 5:00 PM">4:00 PM — 5:00 PM (Late Afternoon)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#8D9188] mb-2 font-semibold">
                  Maximum price?
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="5"
                    max="15"
                    step="0.5"
                    value={reqMaxPrice}
                    onChange={(e) => setReqMaxPrice(Number(e.target.value))}
                    className="flex-1 px-5 py-4 rounded-2xl border border-[#E6E2D8] dark:border-[#2C2D29] bg-[#FAF8F5] dark:bg-[#111210] font-mono text-xl font-bold text-[#1A1B19] dark:text-[#EDEDE8] focus:outline-none focus:border-[#B45309]"
                    required
                  />
                  <span className="font-mono text-lg font-bold text-[#686B63]">₹ / kWh</span>
                </div>
                <div className="text-[11px] text-[#8D9188] mt-2 font-mono">
                  Standard utility grid rate is ₹10.00 / kWh
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full py-5 rounded-full bg-[#1A1B19] dark:bg-[#EDEDE8] hover:bg-[#2C2D29] dark:hover:bg-[#FFFFFF] text-white dark:text-[#1A1B19] font-heading font-extrabold text-base transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Find Matches</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          VIEW 3: SEARCHING
          ========================================================= */}
      {currentView === 'searching' && (
        <div className="max-w-md mx-auto text-center py-20">
          <div className="w-16 h-16 rounded-full bg-[#FEF3C7] dark:bg-[#2A2312] text-[#B45309] dark:text-[#E5A93C] flex items-center justify-center mx-auto mb-6 animate-pulse">
            <Zap className="w-8 h-8 fill-current" />
          </div>
          <h3 className="font-heading text-2xl font-bold text-[#1A1B19] dark:text-[#EDEDE8]">
            Finding all available solar matches...
          </h3>
          <p className="mt-2 text-xs sm:text-sm text-[#686B63] dark:text-[#8D9188]">
            Evaluating neighborhood proximity, solar availability, pricing, and grid capacity across all registered producers.
          </p>
        </div>
      )}

      {/* =========================================================
          VIEW 4: ALL MATCHES RESULTS (BEST MATCH FIRST)
          ========================================================= */}
      {currentView === 'matches' && (
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E8F2EC] dark:bg-[#1B2920] text-[#2D6A4F] dark:text-[#52B788] text-xs font-mono font-bold mb-2">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{matches.length} Matching Producers Available</span>
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-[#1A1B19] dark:text-[#EDEDE8]">
              Available Solar Matches
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-[#686B63] dark:text-[#8D9188] max-w-xl mx-auto">
              Ranked dynamically by Smart Match Score (proximity, surplus volume, price competitiveness, and grid reliability).
            </p>
          </div>

          {matches.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-[#FFFFFF] dark:bg-[#171816] border border-[#E6E2D8] dark:border-[#2A2B27]">
              <Clock className="w-10 h-10 text-[#8D9188] mx-auto mb-3" />
              <h3 className="font-heading font-bold text-lg text-[#1A1B19] dark:text-[#EDEDE8]">
                No matching energy listings found
              </h3>
              <p className="text-xs text-[#686B63] dark:text-[#8D9188] mt-1 mb-6">
                Try adjusting your required quantity or increasing your maximum price limit.
              </p>
              <button
                onClick={() => setCurrentView('find_form')}
                className="px-6 py-3 rounded-full bg-[#1A1B19] dark:bg-[#EDEDE8] text-white dark:text-[#1A1B19] text-xs font-bold cursor-pointer"
              >
                Adjust Search Parameters
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {matches.map((m, idx) => {
                const isBestMatch = idx === 0;
                const sellerName =
                  m.prosumer?.user?.name ||
                  (m.prosumer?.id ? `Prosumer (${m.prosumer.id})` : 'Registered Prosumer');
                const sellerLocation =
                  m.prosumer?.user?.location || `Zone ${m.listing?.grid_zone?.zone_name || 'A'}`;
                const finalPrice = m.pricing_breakdown?.final_price || m.listing?.price || 7.5;
                const totalCost = (finalPrice * reqQty).toFixed(2);
                const isSelected = selectedMatch?.id === m.id;

                return (
                  <div
                    key={m.id || idx}
                    className={`p-6 sm:p-8 rounded-3xl transition-all relative ${isBestMatch
                        ? 'bg-[#FFFFFF] dark:bg-[#171816] border-2 border-[#1A1B19] dark:border-[#EDEDE8] shadow-lg'
                        : 'bg-[#FFFFFF] dark:bg-[#171816] border border-[#E6E2D8] dark:border-[#2A2B27] shadow-xs hover:border-[#1A1B19] dark:hover:border-[#EDEDE8]'
                      }`}
                  >
                    {/* Top Badges */}
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <div className="flex items-center gap-2">
                        {isBestMatch ? (
                          <span className="px-3.5 py-1 rounded-full bg-[#E8F2EC] dark:bg-[#1B2920] text-[#2D6A4F] dark:text-[#52B788] text-xs font-mono font-bold flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5" /> BEST MATCH
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full bg-[#F3EFE8] dark:bg-[#20211D] text-[#686B63] dark:text-[#8D9188] text-xs font-mono font-bold">
                            Match #{idx + 1}
                          </span>
                        )}
                        <span className="px-3 py-1 rounded-full bg-[#FEF3C7] dark:bg-[#2A2312] text-[#B45309] dark:text-[#E5A93C] text-xs font-mono font-bold">
                          {m.match_score}% Score
                        </span>
                      </div>

                      <div className="text-right font-mono text-xs text-[#8D9188]">
                        Surplus: <strong className="text-[#1A1B19] dark:text-[#EDEDE8]">{m.listing?.quantity || 5.0} kWh</strong>
                      </div>
                    </div>

                    {/* Prosumer Details */}
                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <span className="text-[11px] font-mono uppercase tracking-wider text-[#8D9188] block">
                            Solar Producer
                          </span>
                          <h3 className="font-heading text-xl sm:text-2xl font-extrabold text-[#1A1B19] dark:text-[#EDEDE8]">
                            {sellerName}
                          </h3>
                          <div className="text-xs text-[#686B63] dark:text-[#8D9188] mt-0.5 flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-[#2D6A4F] shrink-0" />
                            <span>{sellerLocation}</span>
                          </div>
                        </div>

                        <div className="text-left sm:text-right font-mono">
                          <div className="text-2xl font-extrabold text-[#2D6A4F] dark:text-[#52B788]">
                            ₹{finalPrice.toFixed(2)}<span className="text-xs font-normal text-[#8D9188]">/kWh</span>
                          </div>
                          <div className="text-xs text-[#686B63] dark:text-[#8D9188]">
                            Est. Total: ₹{totalCost}
                          </div>
                        </div>
                      </div>

                      {/* Key Stats Bar */}
                      <div className="grid grid-cols-3 gap-3 p-3.5 rounded-2xl bg-[#FAF8F5] dark:bg-[#1E1F1C] border border-[#E6E2D8] dark:border-[#2A2B27] text-xs font-mono">
                        <div>
                          <span className="text-[10px] text-[#8D9188] uppercase block">Trade Volume</span>
                          <span className="font-bold text-[#1A1B19] dark:text-[#EDEDE8]">{reqQty} kWh</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-[#8D9188] uppercase block">Delivery Window</span>
                          <span className="font-bold text-[#1A1B19] dark:text-[#EDEDE8]">{m.listing?.start_time || '14:00'} - {m.listing?.end_time || '15:00'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-[#8D9188] uppercase block">Reliability</span>
                          <span className="font-bold text-[#2D6A4F] dark:text-[#52B788]">{m.prosumer?.reliability_score || 90}%</span>
                        </div>
                      </div>

                      {/* Reason Badges */}
                      <div className="flex flex-wrap gap-1.5 text-xs font-mono">
                        {m.reasons && m.reasons.length > 0 ? (
                          m.reasons.map((r, rIdx) => (
                            <span
                              key={rIdx}
                              className="px-2.5 py-1 rounded-full bg-[#EFECE4] dark:bg-[#252723] text-[#1A1B19] dark:text-[#EDEDE8] text-[11px]"
                            >
                              ✓ {r.label}: {r.detail}
                            </span>
                          ))
                        ) : (
                          <>
                            <span className="px-2.5 py-1 rounded-full bg-[#EFECE4] dark:bg-[#252723] text-[#1A1B19] dark:text-[#EDEDE8] text-[11px]">
                              ✓ Nearby
                            </span>
                            <span className="px-2.5 py-1 rounded-full bg-[#EFECE4] dark:bg-[#252723] text-[#1A1B19] dark:text-[#EDEDE8] text-[11px]">
                              ✓ Verified Solar Surplus
                            </span>
                          </>
                        )}
                      </div>

                      {/* Action Button */}
                      <div className="pt-2">
                        <button
                          onClick={() => handleConfirmTrade(m)}
                          disabled={confirming}
                          className={`w-full py-4 rounded-full font-heading font-extrabold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs hover:shadow-md ${isBestMatch
                              ? 'bg-[#1A1B19] dark:bg-[#EDEDE8] hover:bg-[#2C2D29] dark:hover:bg-[#FFFFFF] text-white dark:text-[#1A1B19]'
                              : 'border-2 border-[#1A1B19] dark:border-[#EDEDE8] text-[#1A1B19] dark:text-[#EDEDE8] hover:bg-[#1A1B19] hover:text-white dark:hover:bg-[#EDEDE8] dark:hover:text-[#1A1B19]'
                            }`}
                        >
                          <Zap className="w-4 h-4 fill-current text-[#E5A93C]" />
                          <span>
                            {confirming && isSelected
                              ? 'Scheduling Trade...'
                              : isBestMatch
                                ? `Confirm & Schedule Best Match (${sellerName})`
                                : `Select & Trade with ${sellerName}`}
                          </span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* =========================================================
          VIEW 5: CONFIRMED TRADE RECEIPT
          ========================================================= */}
      {currentView === 'trade_confirmed' && (
        <div className="max-w-md mx-auto text-center py-12">
          <div className="w-16 h-16 rounded-full bg-[#E8F2EC] dark:bg-[#1B2920] text-[#2D6A4F] dark:text-[#52B788] flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="font-heading text-3xl font-bold text-[#1A1B19] dark:text-[#EDEDE8]">
            Trade Confirmed
          </h2>
          <p className="mt-3 text-sm text-[#686B63] dark:text-[#9EA299] leading-relaxed">
            Your {reqQty} kWh clean solar delivery is scheduled for {reqTimeSlot}. Buyer: {userName} (Consumer).
          </p>

          <div className="mt-8 flex flex-col gap-3">
            <button
              onClick={() => setCurrentView('active_trades')}
              className="w-full py-4 rounded-full bg-[#1A1B19] dark:bg-[#EDEDE8] text-white dark:text-[#1A1B19] font-bold text-sm cursor-pointer"
            >
              View in Active Trades
            </button>
            <button
              onClick={() => setCurrentView('overview')}
              className="w-full py-3 rounded-full border border-[#E6E2D8] dark:border-[#2A2B27] text-xs font-mono text-[#686B63] dark:text-[#8D9188] cursor-pointer"
            >
              Return to Overview
            </button>
          </div>
        </div>
      )}

      {/* =========================================================
          VIEW 6: ACTIVE TRADES LIST
          ========================================================= */}
      {currentView === 'active_trades' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#EFECE4] dark:border-[#262723]">
            <div>
              <h2 className="font-heading text-2xl font-bold text-[#1A1B19] dark:text-[#EDEDE8]">
                Active Energy Trades
              </h2>
              <p className="text-xs text-[#8D9188] mt-0.5">
                Trades currently scheduled or executing under smart meter telemetry
              </p>
            </div>
            <button
              onClick={() => setCurrentView('find_form')}
              className="px-4 py-2 rounded-full bg-[#1A1B19] dark:bg-[#EDEDE8] text-white dark:text-[#1A1B19] text-xs font-bold hover:bg-[#2C2D29] transition-colors cursor-pointer"
            >
              + Find More Energy
            </button>
          </div>

          {settlementSuccessMsg && (
            <div className="p-4 rounded-2xl bg-[#E8F2EC] dark:bg-[#1B2920] border border-[#2D6A4F]/30 text-[#2D6A4F] dark:text-[#52B788] text-xs font-mono flex items-center justify-between animate-fadeIn">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-[#2D6A4F] dark:text-[#52B788]" />
                <span>{settlementSuccessMsg}</span>
              </div>
              <button
                onClick={() => setSettlementSuccessMsg(null)}
                className="text-xs underline font-bold cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}

          {activeTrades.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-[#FFFFFF] dark:bg-[#171816] border border-[#E6E2D8] dark:border-[#2A2B27]">
              <Clock className="w-10 h-10 text-[#8D9188] mx-auto mb-3" />
              <h3 className="font-heading font-bold text-base text-[#1A1B19] dark:text-[#EDEDE8]">
                No active trades right now
              </h3>
              <p className="text-xs text-[#686B63] dark:text-[#8D9188] mt-1 mb-6">
                Start by finding renewable energy in your neighborhood.
              </p>
              <button
                onClick={() => setCurrentView('find_form')}
                className="px-6 py-3 rounded-full bg-[#1A1B19] dark:bg-[#EDEDE8] text-white dark:text-[#1A1B19] text-xs font-bold"
              >
                Find Energy Now
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {activeTrades.map((t) => {
                const isSettling = settlingTradeId === t.id;
                return (
                  <div
                    key={t.id}
                    className="p-6 rounded-3xl bg-[#FFFFFF] dark:bg-[#171816] border border-[#E6E2D8] dark:border-[#2A2B27] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3.5 bg-[#E8F2EC] dark:bg-[#1B2920] text-[#2D6A4F] dark:text-[#52B788] rounded-2xl">
                        <Zap className="w-5 h-5 fill-current" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-heading font-bold text-base text-[#1A1B19] dark:text-[#EDEDE8]">
                            Trade #{t.id.slice(-5)}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-[#FEF3C7] text-[#B45309] dark:bg-[#2A2312] dark:text-[#E5A93C]">
                            {t.status}
                          </span>
                        </div>
                        <div className="text-xs text-[#686B63] dark:text-[#8D9188] mt-1 flex flex-wrap items-center gap-2 sm:gap-3">
                          <span>Seller: <strong>{t.seller?.user?.name || 'Rajesh Patel (P001)'}</strong></span>
                          <span>•</span>
                          <span>Time: {t.time_window || '14:00 - 15:00'}</span>
                          <span>•</span>
                          <span>Date: {t.date || 'Today'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:items-end gap-3 font-mono text-xs w-full sm:w-auto">
                      <div className="text-left sm:text-right">
                        <div className="font-extrabold text-base text-[#1A1B19] dark:text-[#EDEDE8]">
                          {t.quantity} kWh @ ₹{t.price.toFixed(2)}/kWh
                        </div>
                        <div className="text-[11px] text-[#2D6A4F] dark:text-[#52B788] font-bold">
                          Total: ₹{t.total_amount.toFixed(2)}
                        </div>
                      </div>

                      <button
                        onClick={() => handleSimulateDelivery(t.id)}
                        disabled={isSettling}
                        className="px-4 py-2 rounded-full bg-[#1A1B19] dark:bg-[#EDEDE8] hover:bg-[#2C2D29] dark:hover:bg-[#FFFFFF] text-white dark:text-[#1A1B19] text-xs font-sans font-bold transition-all flex items-center justify-center gap-2 shadow-xs hover:shadow-md cursor-pointer disabled:opacity-50"
                      >
                        <Zap className="w-3.5 h-3.5 fill-current text-[#E5A93C]" />
                        <span>{isSettling ? 'Simulating...' : 'Simulate Delivery & Settle'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* =========================================================
          VIEW 7: TRADE HISTORY LIST
          ========================================================= */}
      {currentView === 'history' && (
        <div className="space-y-6">
          <div className="pb-4 border-b border-[#EFECE4] dark:border-[#262723]">
            <h2 className="font-heading text-2xl font-bold text-[#1A1B19] dark:text-[#EDEDE8]">
              Trade History & Settlements
            </h2>
            <p className="text-xs text-[#8D9188] mt-0.5">
              Auditable microgrid ledger of completed clean energy deliveries
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[#FFFFFF] dark:bg-[#171816] border border-[#E6E2D8] dark:border-[#2A2B27]">
            {pastTrades.length === 0 ? (
              <div className="divide-y divide-[#EFECE4] dark:divide-[#262723]">
                <div className="py-4 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-sm text-[#1A1B19] dark:text-[#EDEDE8]">
                      Trade #TRD-8841 • Completed
                    </div>
                    <div className="text-xs text-[#8D9188] mt-0.5">
                      Seller: Rajesh Patel (P001) • Delivered 5.0 kWh
                    </div>
                  </div>
                  <div className="text-right font-mono text-xs">
                    <div className="font-bold text-[#1A1B19] dark:text-[#EDEDE8]">₹37.50</div>
                    <span className="text-[10px] text-[#2D6A4F] font-semibold">Settled ✓</span>
                  </div>
                </div>

                <div className="py-4 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-sm text-[#1A1B19] dark:text-[#EDEDE8]">
                      Trade #TRD-8790 • Completed
                    </div>
                    <div className="text-xs text-[#8D9188] mt-0.5">
                      Seller: SolarReserve Beta (P002) • Delivered 4.0 kWh
                    </div>
                  </div>
                  <div className="text-right font-mono text-xs">
                    <div className="font-bold text-[#1A1B19] dark:text-[#EDEDE8]">₹30.00</div>
                    <span className="text-[10px] text-[#2D6A4F] font-semibold">Settled ✓</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-[#EFECE4] dark:divide-[#262723]">
                {pastTrades.map((pt) => (
                  <div key={pt.id} className="py-4 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-sm text-[#1A1B19] dark:text-[#EDEDE8]">
                        Trade #{pt.id.slice(-5)} • {pt.status}
                      </div>
                      <div className="text-xs text-[#8D9188] mt-0.5">
                        Seller: {pt.seller?.user?.name || 'Rajesh Patel (P001)'} • Delivered {pt.quantity} kWh @ ₹{pt.price.toFixed(2)}/kWh
                      </div>
                    </div>
                    <div className="text-right font-mono text-xs">
                      <div className="font-bold text-[#1A1B19] dark:text-[#EDEDE8]">₹{pt.total_amount.toFixed(2)}</div>
                      <span className="text-[10px] text-[#2D6A4F] dark:text-[#52B788] font-semibold">Settled ✓</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================
          VIEW 8: CONSUMER PROFILE & METER INFORMATION
          ========================================================= */}
      {currentView === 'profile' && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="pb-4 border-b border-[#EFECE4] dark:border-[#262723]">
            <h2 className="font-heading text-2xl font-bold text-[#1A1B19] dark:text-[#EDEDE8]">
              Consumer Account Profile
            </h2>
            <p className="text-xs text-[#8D9188] mt-0.5">
              Verified identity and smart meter telemetry details
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-[#FFFFFF] dark:bg-[#171816] border border-[#E6E2D8] dark:border-[#2A2B27] space-y-6">
            <div className="flex items-center gap-4 pb-6 border-b border-[#EFECE4] dark:border-[#262723]">
              <div className="w-14 h-14 rounded-2xl bg-[#E8F2EC] dark:bg-[#1B2920] text-[#2D6A4F] dark:text-[#52B788] flex items-center justify-center font-heading text-2xl font-bold">
                {userName.charAt(0)}
              </div>
              <div>
                <h3 className="font-heading font-extrabold text-xl text-[#1A1B19] dark:text-[#EDEDE8]">
                  {userName}
                </h3>
                <div className="text-xs text-[#8D9188] font-mono">{user?.email}</div>
                <div className="mt-1 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EFECE4] dark:bg-[#20211D] text-[#1A1B19] dark:text-[#EDEDE8] text-[10px] font-mono font-bold">
                  Role: Consumer (C001)
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-4 rounded-2xl bg-[#FAF8F5] dark:bg-[#1C1D1A]">
                <span className="text-[#8D9188] block text-[10px] uppercase">Account ID</span>
                <span className="font-bold text-[#1A1B19] dark:text-[#EDEDE8]">{user?.id || 'usr_c001'}</span>
              </div>
              <div className="p-4 rounded-2xl bg-[#FAF8F5] dark:bg-[#1C1D1A]">
                <span className="text-[#8D9188] block text-[10px] uppercase">Smart Meter</span>
                <span className="font-bold text-[#1A1B19] dark:text-[#EDEDE8]">MTR-C001 (Active)</span>
              </div>
              <div className="p-4 rounded-2xl bg-[#FAF8F5] dark:bg-[#1C1D1A]">
                <span className="text-[#8D9188] block text-[10px] uppercase">Distribution Feeder</span>
                <span className="font-bold text-[#1A1B19] dark:text-[#EDEDE8]">{user?.location || 'Zone A'}</span>
              </div>
              <div className="p-4 rounded-2xl bg-[#FAF8F5] dark:bg-[#1C1D1A]">
                <span className="text-[#8D9188] block text-[10px] uppercase">Lifetime Traded</span>
                <span className="font-bold text-[#2D6A4F] dark:text-[#52B788]">142.5 kWh</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
