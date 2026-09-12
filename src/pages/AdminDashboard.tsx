import React, { useState, useEffect } from 'react';
import { api } from '../services/apiClient';
import { GridZone, User, Trade } from '../types';
import {
  Shield,
  Zap,
  Cpu,
  Users,
  RotateCcw,
  Clock,
  Play,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface Props {
  onTriggerRebalanceDemo: () => void;
}

export const AdminDashboard: React.FC<Props> = ({ onTriggerRebalanceDemo }) => {
  const [adminData, setAdminData] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [zones, setZones] = useState<GridZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Meter simulation inputs
  const [simDelivered, setSimDelivered] = useState('3.5');
  const [simulating, setSimulating] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [dash, usersList, zonesList] = await Promise.all([
        api.getAdminDashboard(),
        api.getAdminUsers(),
        api.getGridZones(),
      ]);

      setAdminData(dash);
      setUsers(usersList);
      setZones(zonesList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleZoneCongestion = async (zoneId: string, current: string) => {
    const next = current === 'Low' ? 'Medium' : current === 'Medium' ? 'High' : 'Low';
    try {
      await api.updateGridZoneCongestion(zoneId, next);
      await loadData();
      setFeedback(`Zone ${zoneId.replace('zone_', '').toUpperCase()} congestion updated to ${next}. Dynamic tariffs and matching weights updated.`);
    } catch (err: any) {
      setFeedback(`Error: ${err.message}`);
    }
  };

  const handleSimulateShortfall = async () => {
    setSimulating(true);
    setFeedback(null);
    try {
      const res = await api.simulateMeterShortfall({
        prosumerId: 'p_001',
        actualDelivered: Number(simDelivered),
      });

      await loadData();
      setFeedback(res.message);
      onTriggerRebalanceDemo();
    } catch (err: any) {
      setFeedback(`Simulation error: ${err.message}`);
    } finally {
      setSimulating(false);
    }
  };

  const handleToggleUserStatus = async (user: User) => {
    const nextStatus = user.status === 'active' ? 'inactive' : 'active';
    try {
      await api.toggleUserStatus(user.id, nextStatus);
      await loadData();
      setFeedback(`User ${user.name} status updated to ${nextStatus}.`);
    } catch (err: any) {
      setFeedback(`Error: ${err.message}`);
    }
  };

  const handleAdvanceTrade = async (tradeId: string, status: string) => {
    try {
      await api.advanceTradeStatus(tradeId, status);
      await loadData();
      setFeedback(`Trade #${tradeId.slice(-5)} status updated to ${status}.`);
    } catch (err: any) {
      setFeedback(`Error: ${err.message}`);
    }
  };

  const handleResetDb = async () => {
    if (!window.confirm('Reset database to clean seed state?')) return;
    try {
      await api.resetDatabase();
      await loadData();
      setFeedback('Database successfully restored to clean demonstration baseline.');
    } catch (err: any) {
      setFeedback(`Reset error: ${err.message}`);
    }
  };

  const metrics = adminData?.metrics || {
    live_generation_kwh: 22.0,
    live_consumption_kwh: 7.7,
    live_surplus_kwh: 14.3,
    active_trades_count: 1,
    forecast_accuracy_pct: 94.2,
    renewable_utilization_pct: 88.5,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 text-[#1A1B19] dark:text-[#EDEDE8] transition-colors">
      {/* Control Room Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-8 border-b border-[#E6E2D8] dark:border-[#262723] gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#8D9188] font-semibold mb-2 uppercase tracking-wider">
            <Shield className="w-3.5 h-3.5" />
            <span>Distribution Grid Oversight</span>
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-[#1A1B19] dark:text-[#EDEDE8] tracking-tight">
            Microgrid Operations Console
          </h1>
          <p className="text-sm text-[#686B63] dark:text-[#9EA299] mt-1">
            Real-time feeder congestion telemetry, automated shortfall rebalancing, and auditable trade settlements
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleResetDb}
            className="px-4 py-2.5 bg-[#FFFFFF] dark:bg-[#1E1F1C] hover:bg-[#F3EFE8] dark:hover:bg-[#252723] text-[#1A1B19] dark:text-[#EDEDE8] font-mono text-xs rounded-full border border-[#E6E2D8] dark:border-[#2C2D29] transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#8D9188]" />
            <span>Reset Demo State</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div className="mt-6 p-4 bg-[#FAF8F5] dark:bg-[#1C1D1A] border border-[#E6E2D8] dark:border-[#2C2D29] rounded-2xl text-xs text-[#1A1B19] dark:text-[#EDEDE8] flex items-center justify-between">
          <span className="font-medium">{feedback}</span>
          <button onClick={() => setFeedback(null)} className="text-[#8D9188] hover:text-[#1A1B19] text-base cursor-pointer">
            &times;
          </button>
        </div>
      )}

      {/* Aggregate Telemetry Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mt-8">
        <div className="bg-[#FFFFFF] dark:bg-[#171816] border border-[#E6E2D8] dark:border-[#2A2B27] rounded-2xl p-4 font-mono shadow-xs">
          <span className="text-[10px] text-[#8D9188] uppercase font-semibold block">Total Generation</span>
          <div className="text-2xl font-extrabold text-[#1A1B19] dark:text-[#EDEDE8] mt-1">{metrics.live_generation_kwh} <span className="text-xs font-normal text-[#8D9188]">kWh</span></div>
          <span className="text-[10px] text-[#8D9188]">Across 3 Prosumers</span>
        </div>

        <div className="bg-[#FFFFFF] dark:bg-[#171816] border border-[#E6E2D8] dark:border-[#2A2B27] rounded-2xl p-4 font-mono shadow-xs">
          <span className="text-[10px] text-[#8D9188] uppercase font-semibold block">Total Demand</span>
          <div className="text-2xl font-extrabold text-[#686B63] dark:text-[#9EA299] mt-1">{metrics.live_consumption_kwh} <span className="text-xs font-normal text-[#8D9188]">kWh</span></div>
          <span className="text-[10px] text-[#8D9188]">Local Neighborhood</span>
        </div>

        <div className="bg-[#FFFFFF] dark:bg-[#171816] border border-[#E6E2D8] dark:border-[#2A2B27] rounded-2xl p-4 font-mono shadow-xs">
          <span className="text-[10px] text-[#B45309] dark:text-[#E5A93C] uppercase font-semibold block">Tradable Surplus</span>
          <div className="text-2xl font-extrabold text-[#B45309] dark:text-[#E5A93C] mt-1">{metrics.live_surplus_kwh} <span className="text-xs font-normal text-[#8D9188]">kWh</span></div>
          <span className="text-[10px] text-[#2D6A4F] dark:text-[#52B788] font-medium">Available on Grid</span>
        </div>

        <div className="bg-[#FFFFFF] dark:bg-[#171816] border border-[#E6E2D8] dark:border-[#2A2B27] rounded-2xl p-4 font-mono shadow-xs">
          <span className="text-[10px] text-[#8D9188] uppercase font-semibold block">Forecast Accuracy</span>
          <div className="text-2xl font-extrabold text-[#1A1B19] dark:text-[#EDEDE8] mt-1">{metrics.forecast_accuracy_pct}%</div>
          <span className="text-[10px] text-[#8D9188]">Solar Irradiance</span>
        </div>

        <div className="bg-[#FFFFFF] dark:bg-[#171816] border border-[#E6E2D8] dark:border-[#2A2B27] rounded-2xl p-4 font-mono shadow-xs">
          <span className="text-[10px] text-[#8D9188] uppercase font-semibold block">Active Trades</span>
          <div className="text-2xl font-extrabold text-[#1A1B19] dark:text-[#EDEDE8] mt-1">{metrics.active_trades_count}</div>
          <span className="text-[10px] text-[#8D9188]">In Delivery</span>
        </div>

        <div className="bg-[#FFFFFF] dark:bg-[#171816] border border-[#E6E2D8] dark:border-[#2A2B27] rounded-2xl p-4 font-mono shadow-xs">
          <span className="text-[10px] text-[#2D6A4F] dark:text-[#52B788] uppercase font-semibold block">Clean Ratio</span>
          <div className="text-2xl font-extrabold text-[#2D6A4F] dark:text-[#52B788] mt-1">{metrics.renewable_utilization_pct}%</div>
          <span className="text-[10px] text-[#8D9188]">Zero Coal Draw</span>
        </div>
      </div>

      {/* Grid Zones & Shortfall Controller */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-10">
        {/* Feeder Zones */}
        <div className="lg:col-span-2 bg-[#FFFFFF] dark:bg-[#171816] border border-[#E6E2D8] dark:border-[#2A2B27] rounded-3xl p-8 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-[#EFECE4] dark:border-[#262723]">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-[#8D9188]" />
              <h3 className="font-heading font-bold text-base text-[#1A1B19] dark:text-[#EDEDE8]">
                Feeder Zones & Line Capacity
              </h3>
            </div>
            <span className="text-xs text-[#8D9188]">Click zone to toggle congestion</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            {zones.map((z) => {
              const isLow = z.congestion_level === 'Low';
              const isMed = z.congestion_level === 'Medium';

              return (
                <div
                  key={z.id}
                  onClick={() => handleToggleZoneCongestion(z.id, z.congestion_level)}
                  className={`p-6 rounded-2xl border transition-all cursor-pointer ${
                    isLow
                      ? 'bg-[#FAF8F5] dark:bg-[#1C1D1A] border-[#E6E2D8] dark:border-[#2C2D29] hover:border-[#2D6A4F]'
                      : isMed
                      ? 'bg-[#FEF3C7]/30 dark:bg-[#2A2312]/30 border-[#FDE68A] dark:border-[#3D321A]'
                      : 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-[#1A1B19] dark:text-[#EDEDE8]">Zone {z.zone_name}</span>
                    <span
                      className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full ${
                        isLow
                          ? 'bg-[#E8F2EC] text-[#2D6A4F] dark:bg-[#1B2920] dark:text-[#52B788]'
                          : isMed
                          ? 'bg-[#FEF3C7] text-[#B45309] dark:bg-[#2E2413] dark:text-[#E5A93C]'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200'
                      }`}
                    >
                      {z.congestion_level}
                    </span>
                  </div>

                  <div className="mt-4 text-xs text-[#686B63] dark:text-[#8D9188] space-y-1.5 font-mono">
                    <div className="flex justify-between">
                      <span>Transformer Load:</span>
                      <strong className="text-[#1A1B19] dark:text-[#EDEDE8]">{z.current_load_pct}%</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Loss Factor:</span>
                      <strong className="text-[#1A1B19] dark:text-[#EDEDE8]">{z.loss_factor_pct}%</strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Shortfall Simulation Box */}
        <div className="bg-[#FFFFFF] dark:bg-[#171816] border border-[#E6E2D8] dark:border-[#2A2B27] rounded-3xl p-8 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-4 border-b border-[#EFECE4] dark:border-[#262723]">
              <Zap className="w-5 h-5 text-[#B45309] dark:text-[#E5A93C] fill-current" />
              <h3 className="font-heading font-bold text-base text-[#1A1B19] dark:text-[#EDEDE8]">
                Simulate Cloud Shortfall
              </h3>
            </div>

            <p className="text-xs text-[#686B63] dark:text-[#9EA299] mt-4 leading-relaxed">
              Inject sudden cloud shading on Seller Rajesh (P001) to observe the secondary rebalancing routing in real time.
            </p>

            <div className="mt-6">
              <label className="block text-xs font-mono uppercase text-[#8D9188] mb-2 font-semibold">
                Actual Delivered Output
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="5.0"
                  value={simDelivered}
                  onChange={(e) => setSimDelivered(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-2xl border border-[#E6E2D8] dark:border-[#2C2D29] bg-[#FAF8F5] dark:bg-[#111210] font-mono text-sm font-bold text-[#1A1B19] dark:text-[#EDEDE8]"
                />
                <span className="font-mono text-xs text-[#8D9188]">kWh (Expected: 5.0)</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleSimulateShortfall}
            disabled={simulating}
            className="w-full mt-6 py-4 rounded-full bg-[#1A1B19] dark:bg-[#EDEDE8] text-white dark:text-[#1A1B19] font-bold text-xs transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{simulating ? 'Processing Rebalance...' : 'Execute Shortfall & Rebalance'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
