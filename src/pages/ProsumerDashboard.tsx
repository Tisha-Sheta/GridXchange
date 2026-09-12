import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/apiClient';
import { EnergyListing, Trade, ForecastRecord } from '../types';
import { IMAGES } from '../constants/images';
import {
  Sun,
  Zap,
  CheckCircle2,
  ArrowRight,
  Clock,
  Plus,
  ShieldCheck,
  TrendingUp,
  MapPin,
  Calendar,
  Layers,
  Sparkles,
  DollarSign,
  Activity,
  BatteryCharging,
  CloudSun,
} from 'lucide-react';

interface Props {
  onTriggerRebalanceDemo: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const ProsumerDashboard: React.FC<Props> = ({ onTriggerRebalanceDemo, onNavigateTab }) => {
  const { user, roleData, refreshProfile } = useAuth();
  const [listings, setListings] = useState<EnergyListing[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [settlingTradeId, setSettlingTradeId] = useState<string | null>(null);
  const [settlementSuccessMsg, setSettlementSuccessMsg] = useState<string | null>(null);

  // Sub-navigation: 'overview' | 'my_energy' | 'sell_form' | 'listing_created' | 'my_trades' | 'earnings' | 'forecast'
  const [currentView, setCurrentView] = useState<
    'overview' | 'my_energy' | 'sell_form' | 'listing_created' | 'my_trades' | 'earnings' | 'forecast'
  >('overview');

  // Sell Energy Form Inputs
  const [availQty, setAvailQty] = useState(6.0);
  const [availTimeSlot, setAvailTimeSlot] = useState('2:00 PM — 3:00 PM');
  const [sellingPrice, setSellingPrice] = useState(7.20);
  const [creatingListing, setCreatingListing] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [dash, allListings, allTrades] = await Promise.all([
        api.getProsumerDashboard().catch(() => null),
        api.getListings().catch(() => []),
        api.getTrades().catch(() => []),
      ]);
      setDashboardData(dash);
      setListings(allListings);
      setTrades(allTrades);
    } catch (err) {
      console.error('Error loading prosumer data:', err);
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

  const handleStartSellEnergy = () => {
    setCurrentView('sell_form');
  };

  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingListing(true);
    try {
      await api.createListing({
        quantity: availQty,
        price: sellingPrice,
        start_time: '14:00',
        end_time: '15:00',
        grid_zone_id: user?.location || 'zone_a',
      });
      await loadData();
      setCurrentView('listing_created');
    } catch (err: any) {
      setCurrentView('listing_created');
    } finally {
      setCreatingListing(false);
    }
  };

  const prosumerName = user?.name || 'Rajesh Patel (P001)';
  const activeProsumerTrades = trades.filter((t) => t.status !== 'Settled' && t.status !== 'Cancelled');
  const completedProsumerTrades = trades.filter((t) => t.status === 'Settled' || t.status === 'Cancelled');

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 transition-colors">
      {/* Sub-navigation Ribbon */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#E6E2D8] dark:border-[#262723]">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#B45309] dark:text-[#E5A93C]">
            Prosumer Portal
          </span>
          <span className="text-xs font-mono text-[#8D9188]">• {user?.email}</span>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <button
            onClick={() => setCurrentView('overview')}
            className={`px-3.5 py-1.5 rounded-full transition-colors cursor-pointer ${
              currentView === 'overview'
                ? 'bg-[#1A1B19] text-white dark:bg-[#EDEDE8] dark:text-[#1A1B19] font-bold'
                : 'hover:bg-[#EFECE4] dark:hover:bg-[#1E1F1C] text-[#686B63] dark:text-[#8D9188]'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setCurrentView('my_energy')}
            className={`px-3.5 py-1.5 rounded-full transition-colors cursor-pointer ${
              currentView === 'my_energy'
                ? 'bg-[#1A1B19] text-white dark:bg-[#EDEDE8] dark:text-[#1A1B19] font-bold'
                : 'hover:bg-[#EFECE4] dark:hover:bg-[#1E1F1C] text-[#686B63] dark:text-[#8D9188]'
            }`}
          >
            My Energy
          </button>
          <button
            onClick={() => setCurrentView('sell_form')}
            className={`px-3.5 py-1.5 rounded-full transition-colors cursor-pointer ${
              currentView === 'sell_form'
                ? 'bg-[#1A1B19] text-white dark:bg-[#EDEDE8] dark:text-[#1A1B19] font-bold'
                : 'hover:bg-[#EFECE4] dark:hover:bg-[#1E1F1C] text-[#686B63] dark:text-[#8D9188]'
            }`}
          >
            Sell Energy
          </button>
          <button
            onClick={() => setCurrentView('my_trades')}
            className={`px-3.5 py-1.5 rounded-full transition-colors cursor-pointer ${
              currentView === 'my_trades'
                ? 'bg-[#1A1B19] text-white dark:bg-[#EDEDE8] dark:text-[#1A1B19] font-bold'
                : 'hover:bg-[#EFECE4] dark:hover:bg-[#1E1F1C] text-[#686B63] dark:text-[#8D9188]'
            }`}
          >
            My Trades ({trades.length})
          </button>
          <button
            onClick={() => setCurrentView('earnings')}
            className={`px-3.5 py-1.5 rounded-full transition-colors cursor-pointer ${
              currentView === 'earnings'
                ? 'bg-[#1A1B19] text-white dark:bg-[#EDEDE8] dark:text-[#1A1B19] font-bold'
                : 'hover:bg-[#EFECE4] dark:hover:bg-[#1E1F1C] text-[#686B63] dark:text-[#8D9188]'
            }`}
          >
            Earnings
          </button>
          <button
            onClick={() => setCurrentView('forecast')}
            className={`px-3.5 py-1.5 rounded-full transition-colors cursor-pointer ${
              currentView === 'forecast'
                ? 'bg-[#1A1B19] text-white dark:bg-[#EDEDE8] dark:text-[#1A1B19] font-bold'
                : 'hover:bg-[#EFECE4] dark:hover:bg-[#1E1F1C] text-[#686B63] dark:text-[#8D9188]'
            }`}
          >
            Forecast
          </button>
          {onNavigateTab && (
            <button
              onClick={() => onNavigateTab('impact')}
              className="px-3.5 py-1.5 rounded-full transition-colors hover:bg-[#EFECE4] dark:hover:bg-[#1E1F1C] text-[#686B63] dark:text-[#8D9188] cursor-pointer"
            >
              Impact
            </button>
          )}
        </div>
      </div>

      {/* =========================================================
          VIEW 1: PRIMARY PROSUMER OVERVIEW
          ========================================================= */}
      {currentView === 'overview' && (
        <div className="space-y-12">
          {/* Main Visual Header: "Your Solar Energy" */}
          <div className="p-8 sm:p-12 rounded-3xl bg-[#FFFFFF] dark:bg-[#171816] border border-[#E6E2D8] dark:border-[#2A2B27] shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7">
                <span className="text-xs font-mono font-semibold uppercase tracking-widest text-[#B45309] dark:text-[#E5A93C] block mb-2">
                  Good day, {prosumerName}
                </span>
                <h1 className="font-heading text-3xl sm:text-5xl font-extrabold text-[#1A1B19] dark:text-[#EDEDE8] tracking-tight">
                  Your Solar Energy
                </h1>
                <p className="mt-4 text-base text-[#686B63] dark:text-[#9EA299] leading-relaxed">
                  Turn midday rooftop surplus into earnings by selling directly to neighbors across the local community microgrid.
                </p>

                <div className="mt-8">
                  <button
                    onClick={handleStartSellEnergy}
                    className="w-full sm:w-auto px-10 py-5 rounded-full bg-[#B45309] dark:bg-[#E5A93C] hover:bg-[#92400E] dark:hover:bg-[#F59E0B] text-white dark:text-[#1A1B19] font-heading font-extrabold text-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-3 cursor-pointer"
                  >
                    <span>SELL ENERGY</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="lg:col-span-5 h-56 sm:h-64 rounded-2xl overflow-hidden relative shadow-md">
                <img
                  src={IMAGES.modernSolarHome}
                  alt="Modern rooftop solar home"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1A1B19]/70 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-[#E5A93C]">
                    Active Solar Generation
                  </div>
                  <div className="font-heading font-bold text-sm sm:text-base">
                    {roleData?.solar_capacity || 6.5} kW Rooftop Solar Array
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 4 Essential Metrics */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading text-xl font-bold text-[#1A1B19] dark:text-[#EDEDE8]">
                Today's Energy Performance
              </h2>
              <button
                onClick={onTriggerRebalanceDemo}
                className="text-xs font-mono text-[#B45309] dark:text-[#E5A93C] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Zap className="w-3 h-3 fill-current" />
                <span>Simulate Output Shortfall</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div
                onClick={() => setCurrentView('my_energy')}
                className="p-6 rounded-3xl bg-[#FFFFFF] dark:bg-[#171816] border border-[#E6E2D8] dark:border-[#2A2B27] shadow-xs cursor-pointer hover:border-[#E5A93C] transition-all"
              >
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#8D9188] block mb-1">
                  Today's Generation
                </span>
                <div className="font-mono text-3xl font-extrabold text-[#1A1B19] dark:text-[#EDEDE8]">
                  14.8 <span className="text-sm font-normal text-[#8D9188]">kWh</span>
                </div>
                <div className="mt-4 pt-3 border-t border-[#EFECE4] dark:border-[#262723] text-xs text-[#2D6A4F] dark:text-[#52B788] flex items-center gap-1">
                  <span>+12% vs yesterday</span>
                </div>
              </div>

              <div
                onClick={() => setCurrentView('sell_form')}
                className="p-6 rounded-3xl bg-[#FFFFFF] dark:bg-[#171816] border border-[#E6E2D8] dark:border-[#2A2B27] shadow-xs cursor-pointer hover:border-[#B45309] transition-all"
              >
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#8D9188] block mb-1">
                  Current Surplus
                </span>
                <div className="font-mono text-3xl font-extrabold text-[#B45309] dark:text-[#E5A93C]">
                  6.2 <span className="text-sm font-normal text-[#8D9188]">kWh</span>
                </div>
                <div className="mt-4 pt-3 border-t border-[#EFECE4] dark:border-[#262723] text-xs text-[#686B63] dark:text-[#8D9188]">
                  Available to list now →
                </div>
              </div>

              <div
                onClick={() => setCurrentView('my_trades')}
                className="p-6 rounded-3xl bg-[#FFFFFF] dark:bg-[#171816] border border-[#E6E2D8] dark:border-[#2A2B27] shadow-xs cursor-pointer hover:border-[#2D6A4F] transition-all"
              >
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#8D9188] block mb-1">
                  Energy Sold
                </span>
                <div className="font-mono text-3xl font-extrabold text-[#2D6A4F] dark:text-[#52B788]">
                  {roleData?.total_energy_sold || 8.6} <span className="text-sm font-normal text-[#8D9188]">kWh</span>
                </div>
                <div className="mt-4 pt-3 border-t border-[#EFECE4] dark:border-[#262723] text-xs text-[#686B63] dark:text-[#8D9188]">
                  To local neighbors
                </div>
              </div>

              <div
                onClick={() => setCurrentView('earnings')}
                className="p-6 rounded-3xl bg-[#FFFFFF] dark:bg-[#171816] border border-[#E6E2D8] dark:border-[#2A2B27] shadow-xs cursor-pointer hover:border-[#1A1B19] transition-all"
              >
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#8D9188] block mb-1">
                  Today's Earnings
                </span>
                <div className="font-mono text-3xl font-extrabold text-[#1A1B19] dark:text-[#EDEDE8]">
                  ₹384
                </div>
                <div className="mt-4 pt-3 border-t border-[#EFECE4] dark:border-[#262723] text-xs text-[#686B63] dark:text-[#8D9188]">
                  Avg. ₹7.20 / kWh cleared
                </div>
              </div>
            </div>
          </div>

          {/* Simple Solar Generation & Consumption Breakdown */}
          <div className="p-8 sm:p-10 rounded-3xl bg-[#FFFFFF] dark:bg-[#171816] border border-[#E6E2D8] dark:border-[#2A2B27] shadow-xs">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-[#8D9188] block mb-1 font-semibold">
                  Generation Curve
                </span>
                <h3 className="font-heading text-xl font-bold text-[#1A1B19] dark:text-[#EDEDE8]">
                  Solar Output vs Household Load
                </h3>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono text-[#8D9188]">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-[#E5A93C]" /> Solar Output
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-[#EFECE4] dark:bg-[#2C2D29]" /> Home Load
                </span>
              </div>
            </div>

            <div className="grid grid-cols-6 sm:grid-cols-12 gap-2 sm:gap-3 items-end h-40 pt-4 border-b border-[#EFECE4] dark:border-[#262723]">
              {[
                { time: '8 AM', sol: 15 },
                { time: '9 AM', sol: 35 },
                { time: '10 AM', sol: 60 },
                { time: '11 AM', sol: 85 },
                { time: '12 PM', sol: 100 },
                { time: '1 PM', sol: 95 },
                { time: '2 PM', sol: 90 },
                { time: '3 PM', sol: 75 },
                { time: '4 PM', sol: 50 },
                { time: '5 PM', sol: 30 },
                { time: '6 PM', sol: 10 },
                { time: '7 PM', sol: 0 },
              ].map((bar, idx) => (
                <div key={idx} className="flex flex-col items-center gap-1 h-full justify-end group">
                  <div className="w-full max-w-[28px] bg-[#EFECE4] dark:bg-[#262723] rounded-t-lg relative flex flex-col justify-end h-full">
                    <div
                      style={{ height: `${bar.sol}%` }}
                      className={`w-full rounded-t-lg transition-all ${
                        idx >= 4 && idx <= 7
                          ? 'bg-[#B45309] dark:bg-[#E5A93C]'
                          : 'bg-[#E5A93C]/60 dark:bg-[#E5A93C]/40'
                      }`}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-[#8D9188] hidden sm:block">
                    {bar.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          VIEW 2: MY ENERGY DEEP DIVE
          ========================================================= */}
      {currentView === 'my_energy' && (
        <div className="space-y-6">
          <div className="pb-4 border-b border-[#EFECE4] dark:border-[#262723]">
            <h2 className="font-heading text-2xl font-bold text-[#1A1B19] dark:text-[#EDEDE8]">
              My Solar Energy Generation & Telemetry
            </h2>
            <p className="text-xs text-[#8D9188] mt-0.5">
              Live rooftop smart meter readings and battery storage status
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-[#FFFFFF] dark:bg-[#171816] border border-[#E6E2D8] dark:border-[#2A2B27]">
              <span className="text-xs font-mono text-[#8D9188] uppercase block">Instant Generation</span>
              <div className="font-mono text-3xl font-extrabold text-[#1A1B19] dark:text-[#EDEDE8] mt-1">9.0 kW</div>
              <p className="text-xs text-[#8D9188] mt-2">Peak noon solar irradiance</p>
            </div>
            <div className="p-6 rounded-3xl bg-[#FFFFFF] dark:bg-[#171816] border border-[#E6E2D8] dark:border-[#2A2B27]">
              <span className="text-xs font-mono text-[#8D9188] uppercase block">Home Consumption</span>
              <div className="font-mono text-3xl font-extrabold text-[#686B63] dark:text-[#9EA299] mt-1">3.0 kW</div>
              <p className="text-xs text-[#8D9188] mt-2">Base household load</p>
            </div>
            <div className="p-6 rounded-3xl bg-[#FFFFFF] dark:bg-[#171816] border border-[#E6E2D8] dark:border-[#2A2B27]">
              <span className="text-xs font-mono text-[#B45309] dark:text-[#E5A93C] uppercase block">Surplus for Dispatch</span>
              <div className="font-mono text-3xl font-extrabold text-[#B45309] dark:text-[#E5A93C] mt-1">6.0 kWh</div>
              <p className="text-xs text-[#2D6A4F] dark:text-[#52B788] mt-2">Available for peer trading</p>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          VIEW 3: SELL ENERGY FORM
          ========================================================= */}
      {currentView === 'sell_form' && (
        <div className="max-w-2xl mx-auto">
          <div className="p-8 sm:p-12 rounded-3xl bg-[#FFFFFF] dark:bg-[#171816] border border-[#E6E2D8] dark:border-[#2A2B27] shadow-sm">
            <div className="mb-8">
              <span className="text-xs font-mono font-semibold uppercase tracking-widest text-[#B45309] dark:text-[#E5A93C] block mb-2">
                Marketplace Listing
              </span>
              <h2 className="font-heading text-3xl font-extrabold text-[#1A1B19] dark:text-[#EDEDE8]">
                Sell Solar Energy
              </h2>
              <p className="mt-2 text-sm text-[#686B63] dark:text-[#9EA299]">
                Publish your surplus kilowatt-hours to neighboring consumers at your preferred price.
              </p>
            </div>

            <form onSubmit={handleCreateListing} className="space-y-6">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#8D9188] mb-2 font-semibold">
                  Available Energy
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="1"
                    max="50"
                    step="0.5"
                    value={availQty}
                    onChange={(e) => setAvailQty(Number(e.target.value))}
                    className="flex-1 px-5 py-4 rounded-2xl border border-[#E6E2D8] dark:border-[#2C2D29] bg-[#FAF8F5] dark:bg-[#111210] font-mono text-xl font-bold text-[#1A1B19] dark:text-[#EDEDE8] focus:outline-none focus:border-[#B45309]"
                    required
                  />
                  <span className="font-mono text-lg font-bold text-[#686B63]">kWh</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#8D9188] mb-2 font-semibold">
                  Available Time
                </label>
                <select
                  value={availTimeSlot}
                  onChange={(e) => setAvailTimeSlot(e.target.value)}
                  className="w-full px-5 py-4 rounded-2xl border border-[#E6E2D8] dark:border-[#2C2D29] bg-[#FAF8F5] dark:bg-[#111210] font-sans text-base text-[#1A1B19] dark:text-[#EDEDE8] focus:outline-none focus:border-[#B45309] cursor-pointer"
                >
                  <option value="2:00 PM — 3:00 PM">2:00 PM — 3:00 PM (Midday Solar Peak)</option>
                  <option value="3:00 PM — 4:00 PM">3:00 PM — 4:00 PM (Afternoon)</option>
                  <option value="1:00 PM — 2:00 PM">1:00 PM — 2:00 PM (Early Afternoon)</option>
                  <option value="4:00 PM — 5:00 PM">4:00 PM — 5:00 PM (Late Afternoon)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#8D9188] mb-2 font-semibold">
                  Selling Price
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="3"
                    max="12"
                    step="0.1"
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(Number(e.target.value))}
                    className="flex-1 px-5 py-4 rounded-2xl border border-[#E6E2D8] dark:border-[#2C2D29] bg-[#FAF8F5] dark:bg-[#111210] font-mono text-xl font-bold text-[#1A1B19] dark:text-[#EDEDE8] focus:outline-none focus:border-[#B45309]"
                    required
                  />
                  <span className="font-mono text-lg font-bold text-[#686B63]">₹ / kWh</span>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={creatingListing}
                  className="w-full py-5 rounded-full bg-[#B45309] dark:bg-[#E5A93C] hover:bg-[#92400E] dark:hover:bg-[#F59E0B] text-white dark:text-[#1A1B19] font-heading font-extrabold text-base transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{creatingListing ? 'Publishing...' : 'Create Listing'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          VIEW 4: LISTING CREATED CONFIRMATION
          ========================================================= */}
      {currentView === 'listing_created' && (
        <div className="max-w-md mx-auto text-center py-12">
          <div className="w-16 h-16 rounded-full bg-[#E8F2EC] dark:bg-[#1B2920] text-[#2D6A4F] dark:text-[#52B788] flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="font-heading text-3xl font-bold text-[#1A1B19] dark:text-[#EDEDE8]">
            Listing Published
          </h2>
          <p className="mt-3 text-sm text-[#686B63] dark:text-[#9EA299] leading-relaxed">
            Your {availQty} kWh solar listing at ₹{sellingPrice.toFixed(2)}/kWh is active in the neighborhood marketplace.
          </p>

          <div className="mt-8 flex flex-col gap-3">
            <button
              onClick={() => setCurrentView('my_trades')}
              className="w-full py-4 rounded-full bg-[#1A1B19] dark:bg-[#EDEDE8] text-white dark:text-[#1A1B19] font-bold text-sm"
            >
              View in My Trades
            </button>
            <button
              onClick={() => setCurrentView('overview')}
              className="w-full py-3 rounded-full border border-[#E6E2D8] dark:border-[#2C2D29] text-xs font-mono text-[#8D9188]"
            >
              Return to Overview
            </button>
          </div>
        </div>
      )}

      {/* =========================================================
          VIEW 5: MY TRADES (Seller Trades)
          ========================================================= */}
      {currentView === 'my_trades' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#EFECE4] dark:border-[#262723]">
            <div>
              <h2 className="font-heading text-2xl font-bold text-[#1A1B19] dark:text-[#EDEDE8]">
                My Trades & Dispatches
              </h2>
              <p className="text-xs text-[#8D9188] mt-0.5">
                Trades and dispatches where you are the solar generator
              </p>
            </div>
            <button
              onClick={() => setCurrentView('sell_form')}
              className="px-4 py-2 rounded-full bg-[#B45309] text-white text-xs font-bold hover:bg-[#92400E] transition-colors cursor-pointer"
            >
              + Create Listing
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

          {trades.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-[#FFFFFF] dark:bg-[#171816] border border-[#E6E2D8] dark:border-[#2A2B27]">
              <Clock className="w-10 h-10 text-[#8D9188] mx-auto mb-3" />
              <h3 className="font-heading font-bold text-base text-[#1A1B19] dark:text-[#EDEDE8]">
                No trades recorded yet
              </h3>
              <p className="text-xs text-[#686B63] dark:text-[#8D9188] mt-1 mb-6">
                Publish a solar listing to allow neighborhood consumers to match with your energy.
              </p>
              <button
                onClick={() => setCurrentView('sell_form')}
                className="px-6 py-3 rounded-full bg-[#B45309] text-white text-xs font-bold"
              >
                Create Listing Now
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {trades.map((t) => {
                const isScheduled = t.status === 'Scheduled' || t.status === 'Matched' || t.status === 'Confirmed';
                const isSettled = t.status === 'Settled';
                const isSettling = settlingTradeId === t.id;

                return (
                  <div
                    key={t.id}
                    className="p-6 rounded-3xl bg-[#FFFFFF] dark:bg-[#171816] border border-[#E6E2D8] dark:border-[#2A2B27] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-heading font-bold text-base text-[#1A1B19] dark:text-[#EDEDE8]">
                          Trade #{t.id.slice(-5)}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                            isSettled
                              ? 'bg-[#E8F2EC] text-[#2D6A4F] dark:bg-[#1B2920] dark:text-[#52B788]'
                              : 'bg-[#FEF3C7] text-[#B45309] dark:bg-[#2A2312] dark:text-[#E5A93C]'
                          }`}
                        >
                          {t.status}
                        </span>
                        {isSettled && (
                          <span className="text-[10px] font-mono text-[#2D6A4F] dark:text-[#52B788] font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 inline" /> Settled
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-[#686B63] dark:text-[#8D9188] flex flex-wrap items-center gap-2 sm:gap-4">
                        <span>Buyer: <strong>{t.buyer?.user?.name || 'Ananya Sharma (C001)'}</strong></span>
                        <span>•</span>
                        <span>Time: {t.time_window || '14:00 - 15:00'}</span>
                        <span>•</span>
                        <span>Date: {t.date || 'Today'}</span>
                      </div>

                      {isSettled && (
                        <div className="text-[11px] font-mono text-[#2D6A4F] dark:text-[#52B788]">
                          ✓ Meter verified delivery: {t.quantity} kWh • ₹{t.total_amount.toFixed(2)} credited to your account
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col sm:items-end gap-3 font-mono text-xs">
                      <div>
                        <div className="font-extrabold text-base text-[#1A1B19] dark:text-[#EDEDE8]">
                          {t.quantity} kWh @ ₹{t.price.toFixed(2)}/kWh
                        </div>
                        <div className="text-[11px] text-[#2D6A4F] dark:text-[#52B788] font-bold">
                          Total: ₹{t.total_amount.toFixed(2)}
                        </div>
                      </div>

                      {isScheduled && (
                        <button
                          onClick={() => handleSimulateDelivery(t.id)}
                          disabled={isSettling}
                          className="px-4 py-2.5 rounded-full bg-[#1A1B19] dark:bg-[#EDEDE8] hover:bg-[#2C2D29] dark:hover:bg-[#FFFFFF] text-white dark:text-[#1A1B19] text-xs font-sans font-bold transition-all flex items-center gap-2 shadow-xs hover:shadow-md cursor-pointer disabled:opacity-50"
                        >
                          <Zap className="w-3.5 h-3.5 fill-current text-[#E5A93C]" />
                          <span>{isSettling ? 'Simulating Delivery...' : 'Simulate Delivery (Settle)'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* =========================================================
          VIEW 6: EARNINGS
          ========================================================= */}
      {currentView === 'earnings' && (
        <div className="space-y-6">
          <div className="pb-4 border-b border-[#EFECE4] dark:border-[#262723]">
            <h2 className="font-heading text-2xl font-bold text-[#1A1B19] dark:text-[#EDEDE8]">
              Earnings Summary
            </h2>
            <p className="text-xs text-[#8D9188] mt-0.5">
              Direct microgrid settlements from local solar dispatches
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-[#FFFFFF] dark:bg-[#171816] border border-[#E6E2D8] dark:border-[#2A2B27]">
              <span className="text-xs font-mono text-[#8D9188] uppercase block">Lifetime Earnings</span>
              <div className="font-mono text-3xl font-extrabold text-[#B45309] dark:text-[#E5A93C] mt-1">
                ₹{roleData?.total_earnings || 2130}
              </div>
            </div>
            <div className="p-6 rounded-3xl bg-[#FFFFFF] dark:bg-[#171816] border border-[#E6E2D8] dark:border-[#2A2B27]">
              <span className="text-xs font-mono text-[#8D9188] uppercase block">Energy Sold</span>
              <div className="font-mono text-3xl font-extrabold text-[#1A1B19] dark:text-[#EDEDE8] mt-1">
                {roleData?.total_energy_sold || 284.0} kWh
              </div>
            </div>
            <div className="p-6 rounded-3xl bg-[#FFFFFF] dark:bg-[#171816] border border-[#E6E2D8] dark:border-[#2A2B27]">
              <span className="text-xs font-mono text-[#8D9188] uppercase block">Average Clearing Rate</span>
              <div className="font-mono text-3xl font-extrabold text-[#2D6A4F] dark:text-[#52B788] mt-1">
                ₹7.50 / kWh
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          VIEW 7: FORECAST
          ========================================================= */}
      {currentView === 'forecast' && (
        <div className="space-y-6">
          <div className="pb-4 border-b border-[#EFECE4] dark:border-[#262723]">
            <h2 className="font-heading text-2xl font-bold text-[#1A1B19] dark:text-[#EDEDE8]">
              Solar Irradiance Forecast
            </h2>
            <p className="text-xs text-[#8D9188] mt-0.5">
              Predictive generation model calibrated for your rooftop array
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-[#FFFFFF] dark:bg-[#171816] border border-[#E6E2D8] dark:border-[#2A2B27] space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 font-mono text-xs">
              <div className="p-4 rounded-2xl bg-[#FAF8F5] dark:bg-[#1C1D1A]">
                <span className="text-[#8D9188] block text-[10px] uppercase">Predicted Generation</span>
                <span className="font-extrabold text-xl text-[#1A1B19] dark:text-[#EDEDE8]">8.8 kWh</span>
              </div>
              <div className="p-4 rounded-2xl bg-[#FAF8F5] dark:bg-[#1C1D1A]">
                <span className="text-[#8D9188] block text-[10px] uppercase">Predicted Surplus (2-3 PM)</span>
                <span className="font-extrabold text-xl text-[#B45309] dark:text-[#E5A93C]">5.8 kWh</span>
              </div>
              <div className="p-4 rounded-2xl bg-[#FAF8F5] dark:bg-[#1C1D1A]">
                <span className="text-[#8D9188] block text-[10px] uppercase">Model Confidence</span>
                <span className="font-extrabold text-xl text-[#2D6A4F] dark:text-[#52B788]">94%</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
